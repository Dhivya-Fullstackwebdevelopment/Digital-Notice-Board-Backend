// models/Complaint.js
import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    complaintId: { type: String, unique: true },
    studentName: String,
    status: { type: String, default: "pending" }, 
    categoryId: String, 
    otherCategory: String,
    deptId: String,     
    otherDept: String,  
    subject: String,
    description: String,
    resolution: { type: String, default: "" }, // Admin Only
    image: String,
    pdf: String
}, { timestamps: true });

export const Complaint = mongoose.model("Complaint", complaintSchema);