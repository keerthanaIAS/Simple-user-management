import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
 {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
 },
 { timestamps: true }
);

export default mongoose.model("User_Management", UserSchema);