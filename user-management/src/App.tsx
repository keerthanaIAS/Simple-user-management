import { useEffect, useState } from "react";
import { deleteUser, createUser, updateUser, getUsers } from "../src/services/userService";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./App.css";

const App = () => {
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const totalPages = Math.ceil(total / rowsPerPage);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [currentUser, setCurrentUser] = useState({ _id: "", name: "", email: "" });
  const [history, setHistory] = useState<{ action: string; user: any; prevUser?: any }[]>([]);
  const [future, setFuture] = useState<{ action: string; user: any; prevUser?: any }[]>([]);

  // Get API
  const fetchUsers = async (search: string, page: number) => {
    setLoading(true);
    try {
      const { users, total } = await getUsers(search, page, rowsPerPage);
      console.log('Fetched Users:', users, 'Total:', total);
      setUsers(users);
      setTotal(total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Store the current state before making changes
  const saveHistory = (action: string, user: any, prevUser?: any) => {
    setHistory((prev) => [...prev, { action, user, prevUser }]);
    setFuture([]); // Clear redo history when a new change is made
  };

  // Handle select checkbox
  const toggleSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Delete function
  const deleteSelectedUsers = async () => {
    if (!selectedUsers.length) return;
    setLoading(true);
    for (const id of selectedUsers) {
      const userToDelete = users.find((u) => u._id === id);
      if (userToDelete) {
        saveHistory("delete", userToDelete);
      }
      await deleteUser(id);
    }
    setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user._id)));
    setSelectedUsers([]);
    setLoading(false);
  };

  // Export users to CSV
  const exportToCSV = () => {
    const csv = Papa.unparse(selectedUsers.map((id) => users.find((u) => u._id === id)));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users.csv");
  };

  // Submit handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.name || !currentUser.email) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      if (modalType === "add") {
        const newUser = await createUser(currentUser);
        saveHistory("add", newUser);
        setUsers((prev) => [...prev, newUser]);
        toast.success("User created successfully");
      } else if (modalType === "edit") {
        const prevUser = users.find((u) => u._id === currentUser._id);
        await updateUser(currentUser._id, currentUser);
        saveHistory("edit", currentUser, prevUser);
        setUsers((prev) =>
          prev.map((user) => (user._id === currentUser._id ? currentUser : user))
        );
        toast.success("User updated successfully");
      }
      fetchUsers(search, page);
      setModalType(null);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: { msg: string }) => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.message || "An error occurred");
      }
    }
    setLoading(false);
  };

  // Undo
  const undo = async () => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [lastAction, ...prev]);
    if (lastAction.action === "edit") {
      await updateUser(lastAction.user._id, lastAction.prevUser);
      setUsers((prev) =>
        prev.map((u) => (u._id === lastAction.user._id ? lastAction.prevUser! : u))
      );
    } else if (lastAction.action === "delete") {
      try {
        const response = await createUser(lastAction.user);
        const restoredUser = response?.user;
        if (!restoredUser || !restoredUser._id) {
          console.error("Undo delete failed: Restored user has no _id", response);
          return;
        }
        setUsers((prev) => [...prev, restoredUser]);
      } catch (error) {
        console.error("Undo delete failed:", error);
      }
    }
  };

  // Redo
  const redo = async () => {
    if (future.length === 0) return;
    const nextAction = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, nextAction]);
    if (nextAction.action === "edit") {
      await updateUser(nextAction.user._id, nextAction.user);
      setUsers((prev) =>
        prev.map((u) => (u._id === nextAction.user._id ? nextAction.user : u))
      );
    } else if (nextAction.action === "delete") {
      await deleteUser(nextAction.user._id);
      setUsers((prev) => prev.filter((u) => u._id !== nextAction.user._id));
    }
  };

  useEffect(() => {
    fetchUsers(search, page);
  }, [search, page]);

  return (
    <div className="container mt-5" style={{ maxHeight: "100vh", overflow: "hidden" }}>
      <h2 className="mb-4 text-center">Simple User Management</h2>
      <ToastContainer position="top-right" autoClose={3000} />
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
      <input
        type="text"
        placeholder="Search users..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={deleteSelectedUsers} disabled={!selectedUsers.length} className="btn btn-danger mb-3">
        Delete Selected
      </button>
      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
      {!loading && (
        <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th className="text-center align-middle" style={{ width: "60px" }}>
                  <input
                    type="checkbox"
                    onChange={() => {
                      setSelectedUsers(
                        selectedUsers.length === users.length ? [] : users.map((user) => user._id)
                      );
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
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-outline-primary">
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-outline-primary">
          Next
        </button>
      </div>
      {modalType && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalType === "add" ? "Add User" : "Edit User"}</h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <input type="text" className="form-control mb-2" placeholder="Name" value={currentUser.name} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} />
                  <input type="email" className="form-control mb-2" placeholder="Email" value={currentUser.email} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} />
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

export default App;