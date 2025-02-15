import User from '../models/user';

export const getUsers = async (req: any, res: any) => {
 try {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchFilter = search
   ? { name: { $regex: search, $options: "i" } } // Case-insensitive name match
   : {};
  // Count total users matching the search
  const total = await User.countDocuments(searchFilter);
  // Fetch paginated users
  const users = await User.find(searchFilter)
   .skip((page - 1) * limit)
   .limit(limit);
  console.log("users", users)
  if (!users.length) {
   return res.status(404).json({ message: "No users found" });
  }
  res.status(200).json({ users, total });
 } catch (error) {
  console.error("Error fetching users:", error);
  res.status(500).json({ message: "Error fetching users", error });
 }
};

export const createUser = async (req: any, res: any) => {
 try {
  const { name, email } = req.body;
  if (!name || !email) {
   return res.status(400).json({ message: "All fields are required" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
   return res.status(400).json({ message: "Email already exists" });
  }
  const user = await User.create({
   name,
   email,
  });
  res.status(201).json({
   message: "User created successfully",
   user,
  });
 } catch (error) {
  console.error("Error creating user:", error);
  res.status(500).json({ message: "Error creating user", error });
 }
};

export const updateUser = async (req: any, res: any) => {
 try {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!id) {
   return res.status(400).json({ message: "User ID is required" });
  }
  const updatedUser = await User.findByIdAndUpdate(
   id,
   { name, email }
  );
  if (!updatedUser) {
   return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
   message: "User updated successfully",
   response: updatedUser,
  });
 } catch (error) {
  console.error(error);
  res.status(500).json({ message: "Error updating user", error });
 }
};

export const deleteUser = async (req: any, res: any) => {
 try {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
   return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "User deleted successfully", deletedUser });
 } catch (error) {
  console.error("Error deleting user:", error);
  res.status(500).json({ message: "Error deleting user", error });
 }
};

