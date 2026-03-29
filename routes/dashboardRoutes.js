import express from "express";
import { Complaint } from "../models/Complaint.js";
import { Notice } from "../models/Notice.js";
import { Student } from "../models/Student.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
    try {
        const [
            totalComplaints,
            totalNotices,
            totalStudents,
            pendingCount,
            inProgressCount,
            resolvedCount
        ] = await Promise.all([
            Complaint.countDocuments(),
            Notice.countDocuments(),
            Student.countDocuments(),
            Complaint.countDocuments({ status: "pending" }),
            Complaint.countDocuments({ status: "inprogress" }),
            Complaint.countDocuments({ status: "resolved" })    
        ]);

        res.status(200).json({
            Status: 1,
            message: "Dashboard statistics fetched successfully",
            data: {
                totalStudents,
                totalNotices,
                complaints: {
                    total: totalComplaints,
                    pending: pendingCount,
                    inProgress: inProgressCount,
                    resolved: resolvedCount
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            Status: 0,
            error: error.message
        });
    }
});

export default router;