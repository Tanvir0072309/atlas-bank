import express from "express";
import aiController from "../controllers/ai.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// AI Financial Assistant
// ==========================================

router.post("/chat", protect, aiController.chat);

export default router;