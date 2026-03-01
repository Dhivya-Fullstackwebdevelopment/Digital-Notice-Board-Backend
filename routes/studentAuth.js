import express from "express";
import bcrypt from "bcryptjs";
import { Student } from "../models/Student.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { registerNo, password } = req.body;

    const student = await Student.findOne({ registerNo });

    if (!student) {
      return res.status(401).json({
        Status: 0,
        message: "Invalid Register Number"
      });
    }

    if (password !== student.password) {
      return res.status(401).json({
        Status: 0,
        message: "Invalid Password"
      });
    }

    res.status(200).json({
      Status: 1,
      message: "Login Successful",
      data: {
        name: student.name,
        registerNo: student.registerNo
      }
    });

  } catch (error) {
    res.status(500).json({ Status: 0, error: error.message });
  }
});

export default router;