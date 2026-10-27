import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/admin/all", protect, adminOnly, getAllBookings);
router.get("/:id", protect, getBookingById);
router.post("/:id/cancel", protect, cancelBooking);

export default router;
