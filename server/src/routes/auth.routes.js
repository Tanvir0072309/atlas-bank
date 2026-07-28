import express from "express";

import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    loginRateLimiter,
    otpRateLimiter,
    resendRateLimiter,
} from "../middlewares/rateLimiter.middleware.js";
import {
    registerSchema,
    loginSchema,
    verifyLoginSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    verifyResetCodeSchema,
    resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

// ==========================================
// Authentication
// ==========================================

router.post("/register", validate(registerSchema), authController.register);

router.post("/login", loginRateLimiter, validate(loginSchema), authController.login);

router.post(
    "/verify-login",
    otpRateLimiter,
    validate(verifyLoginSchema),
    authController.verifyLogin
);

// NEW: was missing entirely — the frontend already calls this endpoint.
router.post(
    "/resend-otp",
    resendRateLimiter,
    validate(resendOtpSchema),
    authController.resendOtp
);

router.post("/refresh-token", authController.refreshAccessToken);

router.post(
    "/forgot-password",
    resendRateLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
);

router.post(
    "/verify-reset-code",
    otpRateLimiter,
    validate(verifyResetCodeSchema),
    authController.verifyResetCode
);

router.post(
    "/reset-password",
    validate(resetPasswordSchema),
    authController.resetPassword
);

// ==========================================
// Email Verification
// ==========================================

router.get("/verify-email", authController.verifyEmail);

// ==========================================
// Protected Routes
// ==========================================

router.get("/profile", protect, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

export default router;