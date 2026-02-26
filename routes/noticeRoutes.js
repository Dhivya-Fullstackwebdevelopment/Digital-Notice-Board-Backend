import express from "express";
import { Notice, Counter } from "../models/Notice.js";
import multer from "multer";

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
        const { title, categoryId, deptId, content } = req.body;

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