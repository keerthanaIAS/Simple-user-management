import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { deleteUser, createUser, updateUser } from "../services/userService";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";

const UserTable = () => {
  const { users, fetchUsers, total, undo, redo } = useUserStore();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / 10);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [currentUser, setCurrentUser] = useState({ _id: "", name: "", email: "" });
  const [error, setError] = useState("");

  const toggleSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const deleteSelectedUsers = async () => {
    setLoading(true);
    for (const id of selectedUsers) {
      await deleteUser(id);
    }
    setSelectedUsers([]);
    fetchUsers(search, page);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers(search, page).finally(() => setLoading(false));
  }, [search, page]);

  const exportToCSV = () => {
    const csv = Papa.unparse(selectedUsers.map((id) => users.find((u) => u._id === id)));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users.csv");
  };

  // Handle form submission for adding/editing users
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.name || !currentUser.email) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    if (modalType === "add") {
      await createUser(currentUser);
    } else if (modalType === "edit") {
      await updateUser(currentUser._id, currentUser);
    }
    fetchUsers(search, page);
    setModalType(null);
    setError("");
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">User Management</h2>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button onClick={undo} className="btn btn-primary">Undo</button>
        <button onClick={redo} className="btn btn-primary">Redo</button>
        <button onClick={exportToCSV} disabled={!selectedUsers.length} className="btn btn-success">
          Export to CSV
        </button>
        <button onClick={() => { setModalType("add"); setCurrentUser({ _id: "", name: "", email: "" }); }} className="btn btn-info">
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Delete Button */}
      <button onClick={deleteSelectedUsers} disabled={!selectedUsers.length} className="btn btn-danger mb-3">
        Delete Selected
      </button>

      {/* Loading Spinner */}
      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}

      {/* User Table */}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={() => {
                      setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((user) => user._id));
                    }}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="text-center">
                      <input type="checkbox" checked={selectedUsers.includes(user._id)} onChange={() => toggleSelection(user._id)} />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button onClick={() => { setModalType("edit"); setCurrentUser(user); }} className="btn btn-warning btn-sm me-2">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-outline-primary">
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-outline-primary">
          Next
        </button>
      </div>

      {/* Modal for Add/Edit User */}
      {modalType && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalType === "add" ? "Add User" : "Edit User"}</h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentUser.name}
                      onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">{modalType === "add" ? "Add User" : "Update User"}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;