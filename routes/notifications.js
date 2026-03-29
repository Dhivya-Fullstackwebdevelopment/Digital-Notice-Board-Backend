import express from "express";
import { Complaint } from "../models/Complaint.js";

const router = express.Router();

router.get("/complaints", async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const notifications = await Complaint.find({ 
            status: "pending",
            isRead: false,
            createdAt: { $gte: sevenDaysAgo } 
        })
        .sort({ createdAt: -1 }); 

        res.status(200).json({
            Status: 1,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ 
            Status: 0, 
            message: "Error fetching all notifications",
            error: error.message 
        });
    }
}); 

router.patch("/clear-all", async (req, res) => {
    try {
        await Complaint.updateMany(
            { status: "pending", isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({
            Status: 1,
            message: "Notifications cleared from list"
        });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

export default router;