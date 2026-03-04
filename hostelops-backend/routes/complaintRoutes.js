import express from "express";
import Complaint from "../models/Complaint.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= SUBMIT COMPLAINT ================= */
router.post("/", protect, async (req, res) => {
  try {
    const { category, description, priority } = req.body;

    const complaint = await Complaint.create({
      student: req.user.id,
      category,
      description,
      priority,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= GET MY COMPLAINTS ================= */
router.get("/my", protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      student: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;