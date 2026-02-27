import express from "express";
import { Complaint } from "../models/Complaint.js";
import { Counter } from "../models/Notice.js"; // Reusing the same counter logic
import multer from "multer";

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage: storage });

//GET
router.get("/all", async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json({ 
            Status: 1, 
            message: "All Complaint fetched successfully", 
            data: complaints 
        });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

// 2. POST - Create Complaint
router.post("/create", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const {
            studentName, status, categoryId, otherCategory,
            deptId, otherDept, subject, description, resolution
        } = req.body;

        const counter = await Counter.findOneAndUpdate(
            { id: "complaintId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const newComplaintId = `CMP${counter.seq.toString().padStart(3, '0')}`;

        const newComplaint = new Complaint({
            complaintId: newComplaintId,
            studentName,
            status: status || "pending",
            subject,
            description,
            resolution: resolution || "", // Add resolution if provided
            categoryId,
            otherCategory: categoryId === "99" ? otherCategory : "",
            deptId,
            otherDept: deptId === "99" ? otherDept : "",
            image: req.files?.['image'] ? req.files['image'][0].path : "",
            pdf: req.files?.['pdf'] ? req.files['pdf'][0].path : ""
        });

        await newComplaint.save();
        res.status(201).json({ Status: 1, message: "complaint added successfully", data: newComplaint });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

// 3. PATCH - Update Complaint (including Admin Resolution)
router.patch("/update/:complaintId", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { complaintId } = req.params;
        let updateData = { ...req.body };

        if (updateData.categoryId) {
            updateData.otherCategory = updateData.categoryId === "99" ? updateData.otherCategory : "";
        }
        if (updateData.deptId) {
            updateData.otherDept = updateData.deptId === "99" ? updateData.otherDept : "";
        }

        if (req.files) {
            if (req.files['image']) updateData.image = req.files['image'][0].path;
            if (req.files['pdf']) updateData.pdf = req.files['pdf'][0].path;
        }

        const updated = await Complaint.findOneAndUpdate(
            { complaintId: complaintId },
            { $set: updateData },
            { new: true }
        );

        if (!updated) return res.status(404).json({ Status: 0, message: "Complaint Not Found" });
        res.status(200).json({ Status: 1, message: "complaint updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

// 4. GET - Single Complaint by ID
router.get("/:complaintId", async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
        if (!complaint) return res.status(404).json({ Status: 0, message: "Not found" });
        res.status(200).json({ Status: 1, message: "complaint fetched successfully", data: complaint });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

// 5. DELETE - Delete Complaint
router.delete("/delete/:complaintId", async (req, res) => {
    try {
        const deleted = await Complaint.findOneAndDelete({ complaintId: req.params.complaintId });
        if (!deleted) return res.status(404).json({ Status: 0, message: "Not found" });
        res.status(200).json({ Status: 1, message: "complaint deleted successfully" });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

export default router;