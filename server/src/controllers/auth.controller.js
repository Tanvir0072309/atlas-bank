import * as authService from "../services/auth.service.js";
import { JWT_CONFIG } from "../config/jwt.config.js";

// ==========================
// REGISTER
// ==========================
export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user,
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};

// ==========================
// STEP 1: LOGIN (Credentials Verification & Send OTP)
// ==========================
export const login = async (req, res) => {
    try {
        const result = await authService.login(
            req.body.email,
            req.body.password
        );

        // Step 1: Return success message for OTP email trigger
        // (Do NOT send JWT/Cookies here; Step 2 will handle tokens)
        res.status(200).json({
            success: true,
            message: result.message || "Verification code sent to your email.",
            remainingAttempts: result.remainingAttempts,
        });

    } catch (error) {
        const statusCode = error.statusCode || 400;

        // Pass remaining attempts and lockout timer to frontend
        res.status(statusCode).json({
            success: false,
            message: error.message || "Invalid credentials.",
            remainingAttempts: error.remainingAttempts,
            lockUntil: error.lockUntil,
        });
    }
};

// ==========================
// VERIFY EMAIL (Account Activation Link)
// ==========================
// ==========================
// VERIFY EMAIL (Account Activation Link)
// ==========================
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const result = await authService.verifyEmailToken(token);

        // Set Refresh Token HttpOnly Cookie
        res.cookie(
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge:
                    JWT_CONFIG.refreshToken.expiresInMs ||
                    7 * 24 * 60 * 60 * 1000,
            }
        );

        return res.status(200).json({
            success: true,
            message: result.message || "Email verified successfully!",
            accessToken: result.accessToken,
            user: result.user,
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Verification failed.",
        });
    }
};

// ==========================
// STEP 2: VERIFY LOGIN (OTP Verification & Set Tokens)
// ==========================
export const verifyLogin = async (req, res) => {
    try {
        const { email, code } = req.body;

        const result = await authService.verifyLogin(
            email,
            code
        );

        // Set Refresh Token HttpOnly Cookie
        res.cookie(
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: JWT_CONFIG.refreshToken.expiresInMs || 7 * 24 * 60 * 60 * 1000,
            }
        );

        return res.status(200).json({
            success: true,
            message: result.message || "Login successful",
            accessToken: result.accessToken,
            user: result.user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Login verification failed.",
            remainingAttempts: error.remainingAttempts,
            lockUntil: error.lockUntil,
        });
    }
};

// ==========================
// REFRESH ACCESS TOKEN
// ==========================
export const refreshAccessToken = async (req, res, next) => {
    try {
        const result = await authService.refreshAccessToken(
            req.cookies.refreshToken
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================
// FORGOT PASSWORD (Send Reset OTP)
// ==========================
export const forgotPassword = async (req, res) => {
    try {
        const result = await authService.forgotPassword(
            req.body.email
        );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message:
                error.message ||
                "Failed to send password reset verification code.",
        });
    }
};

export const verifyResetCode = async (req, res) => {
    try {
        const result =
            await authService.verifyResetCode(
                req.body.email,
                req.body.code
            );

        return res.status(200).json({
            success: true,
            message: result.message,
            resetToken: result.resetToken,
        });
    } catch (error) {
        return res.status(
            error.statusCode || 400
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to verify password reset code.",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const {
            resetToken,
            newPassword,
            confirmPassword,
        } = req.body;

        const result =
            await authService.resetPassword(
                resetToken,
                newPassword,
                confirmPassword
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to reset password.",
        });
    }
};