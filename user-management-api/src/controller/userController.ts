import User from '../models/user';

export const getUsers = async (req: any, res: any) => {
 try {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const searchFilter = search
   ? { name: { $regex: search, $options: "i" } } // Case insensitive name match
   : {};
  const total = await User.countDocuments(searchFilter); // Count total users matching the search
  const users = await User.find(searchFilter) // Fetch paginated users
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
  if (!name || name.trim().length < 2) {
   return res.status(400).json({ message: "Name must be at least 2 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regex for email
  if (!email || !emailRegex.test(email)) {
   return res.status(400).json({ message: "Invalid email format" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
   return res.status(400).json({ message: "Email already exists" });
  }
  const user = await User.create({ name: name.trim(), email: email.trim() });
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
  const existingUser = await User.findById(id);
  if (!existingUser) {
   return res.status(404).json({ message: "User not found" });
  }
  if (name && (typeof name !== "string" || name.trim().length < 2)) {
   return res.status(400).json({ message: "Name must be at least 2 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && (typeof email !== "string" || !emailRegex.test(email))) {
   return res.status(400).json({ message: "Invalid email format" });
  }
  const updatedUser = await User.findByIdAndUpdate(
   id,
   { ...(name && { name: name.trim() }), ...(email && { email: email.trim() }) },
   { new: true }
  );
  res.status(200).json({
   message: "User updated successfully",
   user: updatedUser,
  });
 } catch (error) {
  console.error("Error updating user:", error);
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