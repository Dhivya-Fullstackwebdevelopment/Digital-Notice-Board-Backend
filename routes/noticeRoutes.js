import express from "express";
import { Notice, Counter } from "../models/Notice.js";
import multer from "multer";

const CATEGORIES = [
    { id: "1", label: "Academic" }, { id: "2", label: "Event" },
    { id: "3", label: "Emergency" }, { id: "4", label: "Placement" },
    { id: "5", label: "Examination" }, { id: "6", label: "Scholarship" },
    { id: "7", label: "Sports" }, { id: "8", label: "Hostel" },
    { id: "9", label: "Library" }, { id: "10", label: "Competition" },
    { id: "99", label: "Other" }
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
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Make sure this folder exists!
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 1. POST - Create a new Notice
router.post("/create", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, categoryId, deptId, content, otherCategory, otherDept } = req.body;
        const categoryName = categoryId === "99" ? otherCategory : getCategoryLabel(categoryId);
        const deptName = deptId === "99" ? otherDept : getDeptLabel(deptId);

        const counter = await Counter.findOneAndUpdate(
            { id: "noticeId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const newNoticeId = `NTC${counter.seq.toString().padStart(3, '0')}`;

        const imagePath = req.files && req.files['image'] ? req.files['image'][0].path : "";
        const pdfPath = req.files && req.files['pdf'] ? req.files['pdf'][0].path : "";

        const newNotice = new Notice({
            noticeId: newNoticeId,
            title,
            categoryId,
            deptId,
            categoryName,
            deptName,
            otherCategory: categoryId === "99" ? otherCategory : "",
            otherDept: deptId === "99" ? otherDept : "",
            content,
            image: imagePath,
            pdf: pdfPath
        });

        const savedNotice = await newNotice.save();

        res.status(201).json({
            Status: 1,
            message: "Notice Created Successfully",
            data: savedNotice
        });

    } catch (error) {
        res.status(500).json({
            Status: 0,
            message: "Failed to create notice",
            error: error.message
        });
    }
});

// 2. GET - Get all Notices
router.get("/all", async (req, res) => {
    try {
        const notices = await Notice.find();
        res.status(200).json({ Status: 1, message: "Notices fetched successfully", data: notices });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

// 3. PUT - Update a Notice by ID
router.patch("/update/:noticeId", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { noticeId } = req.params;
        const updateData = { ...req.body };

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

        const updatedNotice = await Notice.findOneAndUpdate(
            { noticeId: noticeId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedNotice) return res.status(404).json({ message: "Notice not found" });

        res.status(200).json({ Status: 1, message: "Notice Updated Successfully", data: updatedNotice });
    } catch (error) {
        res.status(500).json({ Status: 0, error: error.message });
    }
});

// 4. DELETE - Delete a Notice by ID
router.delete("/delete/:noticeId", async (req, res) => {
    try {

        const deletedNotice = await Notice.findOneAndDelete({ noticeId: req.params.noticeId });

        if (!deletedNotice) {
            return res.status(404).json({
                Status: 0,
                message: "Notice not found. Nothing deleted."
            });
        }

        res.status(200).json({
            Status: 1,
            message: "Notice deleted successfully",
            deletedId: req.params.noticeId
        });

    } catch (error) {
        res.status(500).json({
            Status: 0,
            message: "An error occurred during deletion",
            error: error.message
        });
    }
});

// 5. GET - Get a single Notice by noticeId
router.get("/:noticeId", async (req, res) => {
    try {
        const { noticeId } = req.params;

        const notice = await Notice.findOne({ noticeId: noticeId });

        if (!notice) {
            return res.status(404).json({
                Status: 0,
                message: "Notice not found"
            });
        }

        res.status(200).json({
            Status: 1,
            message: "Notice details fetched successfully",
            data: notice
        });

    } catch (error) {
        res.status(500).json({
            Status: 0,
            message: "An error occurred while fetching the notice",
            error: error.message
        });
    }
});

export default router;