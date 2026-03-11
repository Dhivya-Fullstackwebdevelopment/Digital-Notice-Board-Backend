import express from "express";
import { Admin } from "../models/Admin.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, password });

    if (!admin) {
      return res.status(401).json({
        Status: 0,
        message: "Invalid email or password"
      });
    }

    res.status(200).json({
      Status: 1,
      message: "Login successful",
      data: admin
    });

  } catch (error) {
    res.status(500).json({
      Status: 0,
      error: error.message
    });
  }
});

export default router;