import express from "express";

import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// Authentication
// ==========================================

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-login", authController.verifyLogin);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-reset-code", authController.verifyResetCode);

// ==========================================
// Email Verification
// ==========================================

router.get("/verify-email", authController.verifyEmail);

// ==========================================
// Protected Routes
// ==========================================

router.get("/profile", protect, (req, res) => {
    res.status(200).json(req.user);
});

export default router;