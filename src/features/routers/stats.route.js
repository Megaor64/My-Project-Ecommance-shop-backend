import express from "express";
import { getAdminStatsHandler } from "../controllers/stats.controller.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";
import { requireAdmin } from "../../shared/middleware/requireAdmin.js";

const router = express.Router();

router.get("/admin", authMiddleware, requireAdmin, getAdminStatsHandler);

export default router;
