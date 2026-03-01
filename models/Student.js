import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registerNo: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

export const Student = mongoose.model("Student", studentSchema, "studentslogin");