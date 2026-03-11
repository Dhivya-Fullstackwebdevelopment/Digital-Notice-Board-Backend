import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  deptName: String,
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin"
  }
}, { collection: "adminlogin" });

export const Admin = mongoose.model("Admin", AdminSchema);