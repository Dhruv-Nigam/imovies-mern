import express from "express";
import { getAdminStats } from "../controllers/statsController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin", protect, adminOnly, getAdminStats);

export default router;
