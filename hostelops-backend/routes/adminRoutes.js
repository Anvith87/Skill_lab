import express from "express";
import Complaint from "../models/Complaint.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* ===== GET ALL COMPLAINTS ===== */
router.get("/complaints", protect, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name email block roomNumber")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ===== UPDATE STATUS ===== */
router.patch("/complaints/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;