import express from "express";
import {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getAllShowsAdmin,
} from "../controllers/showController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getShows);
router.get("/admin/all", protect, adminOnly, getAllShowsAdmin);
router.get("/:id", getShowById);
router.post("/", protect, adminOnly, createShow);
router.put("/:id", protect, adminOnly, updateShow);
router.delete("/:id", protect, adminOnly, deleteShow);

export default router;
