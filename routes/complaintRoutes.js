import express from "express";
import { Complaint } from "../models/Complaint.js";
import { Counter } from "../models/Notice.js"; // Reusing the same counter logic
import multer from "multer";

const CATEGORIES = [
    { id: "1", label: "Internal Marks Issue" },
    { id: "2", label: "Attendance Shortage Dispute" },
    { id: "3", label: "Exam Timetable Conflict" },
    { id: "4", label: "Result Correction Request" },
    { id: "5", label: "Faculty Behavior Complaint" },
    { id: "6", label: "Project Evaluation Issue" },
    { id: "7", label: "Ragging Complaint" },
    { id: "8", label: "Verbal Harassment" },
    { id: "9", label: "Physical Harassment" },
    { id: "10", label: "Cyber Bullying" },
    { id: "11", label: "Sexual Harassment" },
    { id: "12", label: "Gender Discrimination" },
    { id: "13", label: "Classroom Maintenance" },
    { id: "14", label: "Washroom Cleanliness" },
    { id: "15", label: "Drinking Water Problem" },
    { id: "16", label: "Electrical Issue" },
    { id: "17", label: "Hostel Room Allocation" },
    { id: "18", label: "Hostel Food Quality" },
    { id: "19", label: "Hostel WiFi Problem" },
    { id: "20", label: "Library Resources" },
    { id: "22", label: "Bus/Transport Issue" },
    { id: "24", label: "Certificate Delay" },
    { id: "25", label: "Scholarship Issue" },
    { id: "27", label: "Portal/IT Login Issue" },
    { id: "30", label: "Campus Security Concern" },
    { id: "99", label: "Other" },
];

const DEPARTMENTS = [
    { id: "1", label: "Computer Science & Engineering" },
    { id: "2", label: "Information Technology" },
    { id: "3", label: "Electronics & Communication" },
    { id: "4", label: "Electrical & Electronics" },
    { id: "5", label: "Mechanical Engineering" },
    { id: "6", label: "Civil Engineering" },
    { id: "7", label: "Artificial Intelligence" },
    { id: "8", label: "MBA" },
    { id: "9", label: "BBA" },
    { id: "10", label: "B.Com" },
    { id: "99", label: "Other" }
];

const getCategoryLabel = (id) => CATEGORIES.find(c => c.id === id)?.label || "";
const getDeptLabel = (id) => DEPARTMENTS.find(d => d.id === id)?.label || "";

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
        const categoryName = categoryId === "99" ? otherCategory : getCategoryLabel(categoryId);
        const deptName = deptId === "99" ? otherDept : getDeptLabel(deptId);

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
            categoryName,
            deptName,
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

        // If category is updated, update the Name as well
        if (updateData.categoryId) {
            updateData.categoryName = updateData.categoryId === "99"
                ? updateData.otherCategory
                : getCategoryLabel(updateData.categoryId);

            updateData.otherCategory = updateData.categoryId === "99" ? updateData.otherCategory : "";
        }

        // If department is updated, update the Name as well
        if (updateData.deptId) {
            updateData.deptName = updateData.deptId === "99"
                ? updateData.otherDept
                : getDeptLabel(updateData.deptId);

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