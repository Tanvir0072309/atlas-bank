import { JWT_CONFIG } from "../config/jwt.config.js";
import crypto from "crypto";

import {
    MAX_LOGIN_ATTEMPTS,
    ACCOUNT_LOCK_TIME,
} from "../constants/auth.constants.js";

import {
    comparePassword,
    hashPassword,
} from "../helpers/bcrypt.helper.js";

import {
    generateAccessToken,
    generateRefreshToken,
    generatePasswordResetToken,
    verifyRefreshToken,
    verifyPasswordResetToken,
} from "../helpers/jwt.helper.js";

import { validatePasswordStrength } from "../helpers/password.helper.js";
import { hashRefreshToken } from "../helpers/refreshToken.helper.js";
import { generateRandomToken } from "../helpers/token.helper.js";

import {
    createUser,
    emailExists,
    phoneExists,
    findUserByVerificationToken,
    markEmailAsVerified,
    findUserByEmail,
    findUserById,
    updateLastLogin,
    incrementLoginAttempts,
    lockAccount,
    resetLoginAttempts,
    saveRefreshToken,
    removeRefreshToken,
    removeAllRefreshTokens,
    findUserByRefreshToken,
    saveLoginVerification,
    findUserByEmailForLoginVerification,
    clearLoginVerification,
    updatePasswordResetData,
    findUserByEmailForPasswordReset,
    incrementPasswordResetAttempts,
    clearPasswordResetData,
    updatePassword,
} from "../repositories/auth.repository.js";

import {
    sendVerificationEmail,
    sendLoginVerificationEmail,
    sendPasswordResetEmail,
} from "./email.service.js";

import ApiError from "../utils/ApiError.js";

import {
    generateVerificationCode,
    hashVerificationCode,
} from "../helpers/loginVerification.helper.js";

/* ---------- Helper to normalize email ---------- */
const cleanEmail = (email) => (email ? email.trim().toLowerCase() : "");

/* ---------- 1. REGISTER USER ---------- */
export const registerUser = async (userData) => {
    const { fullName, email, phone, password } = userData;
    const normalizedEmail = cleanEmail(email);

    if (await emailExists(normalizedEmail)) {
        throw new ApiError(409, "Email is already registered.");
    }

    if (await phoneExists(phone)) {
        throw new ApiError(409, "Phone number is already registered.");
    }

    validatePasswordStrength(password);

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateRandomToken();
    const verificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = await createUser({
        fullName,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
        isEmailVerified: false,
    });

    await sendVerificationEmail(normalizedEmail, verificationToken);

    user.password = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiresAt = undefined;

    return user;
};

/* ---------- 2. VERIFY EMAIL TOKEN ---------- */
export const verifyEmailToken = async (token) => {
    if (!token) {
        throw new ApiError(400, "Verification token is required.");
    }

    const user = await findUserByVerificationToken(token);

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification link.");
    }

    if (new Date() > new Date(user.emailVerificationExpiresAt)) {
        throw new ApiError(400, "Verification link has expired. Please request a new one.");
    }

    const updatedUser = await markEmailAsVerified(user._id);

    const accessToken = generateAccessToken({
        id: updatedUser._id,
        email: updatedUser.email,
    });

    return {
        token: accessToken,
        user: updatedUser,
    };
};

/* ---------- 3. LOGIN ---------- */
export const login = async (email, password) => {
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    const normalizedEmail = cleanEmail(email);

    // Find User with normalized email
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Email Verification Check
    if (!user.isEmailVerified) {
        throw new ApiError(
            403,
            "Please verify your email before logging in."
        );
    }

    // Account Status Check
    if (user.status !== "active") {
        throw new ApiError(
            403,
            "Your account is not active. Please contact support."
        );
    }

    // Account Lock Check
    if (user.lockUntil && user.lockUntil > new Date()) {
        throw new ApiError(
            403,
            "Your account is temporarily locked. Please try again later."
        );
    }

    // Password Check
    const isPasswordCorrect = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        const updatedUser = await incrementLoginAttempts(user._id);

        if (updatedUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockUntil = new Date(
                Date.now() + ACCOUNT_LOCK_TIME
            );

            await lockAccount(user._id, lockUntil);

            throw new ApiError(
                403,
                "Your account has been locked for 30 minutes due to multiple failed login attempts."
            );
        }

        throw new ApiError(
            401,
            "Invalid email or password."
        );
    }

    // Reset Failed Attempts
    await resetLoginAttempts(user._id);

    // Update Last Login
    const updatedUser = await updateLastLogin(user._id);

    // Generate Verification Code
    const verificationCode = generateVerificationCode();

    // Hash Verification Code
    const codeHash = hashVerificationCode(verificationCode);

    // Expiry (5 Minutes)
    const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
    );

    // Save Verification Code
    await saveLoginVerification(
        updatedUser._id,
        codeHash,
        expiresAt
    );

    // Send Verification Email
    await sendLoginVerificationEmail(
        updatedUser.email,
        updatedUser.fullName,
        verificationCode
    );

    // Remove Sensitive Fields
    updatedUser.password = undefined;
    updatedUser.emailVerificationToken = undefined;
    updatedUser.emailVerificationExpiresAt = undefined;

    return {
        message: "Verification code sent to your email.",
    };
};

export const verifyLogin = async (email, code) => {
    if (!email || !code) {
        throw new ApiError(
            400,
            "Email and verification code are required."
        );
    }

    const normalizedEmail = cleanEmail(email);

    const user = await findUserByEmailForLoginVerification(normalizedEmail);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (!user.loginVerification?.codeHash) {
        throw new ApiError(
            400,
            "No pending login verification found."
        );
    }

    if (user.loginVerification.expiresAt < new Date()) {
        throw new ApiError(
            400,
            "Verification code has expired."
        );
    }

    const codeHash = hashVerificationCode(code);

    if (codeHash !== user.loginVerification.codeHash) {
        throw new ApiError(
            401,
            "Invalid verification code."
        );
    }

    await clearLoginVerification(user._id);

    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    const refreshToken = generateRefreshToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(
        Date.now() + JWT_CONFIG.refreshToken.expiresInMs
    );

    await saveRefreshToken(
        user._id,
        tokenHash,
        expiresAt
    );

    // Remove Sensitive Fields
    user.password = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiresAt = undefined;
    user.loginVerification = undefined;

    return {
        message: "Login successful.",
        accessToken,
        refreshToken,
        user,
    };
};

export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required.");
    }

    verifyRefreshToken(refreshToken);

    const tokenHash = hashRefreshToken(refreshToken);
    const user = await findUserByRefreshToken(tokenHash);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token.");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(
            403,
            "Please verify your email before continuing."
        );
    }

    if (user.status !== "active") {
        throw new ApiError(
            403,
            "Your account is not active. Please contact support."
        );
    }

    const storedToken = user.refreshTokens.find(
        (token) => token.tokenHash === tokenHash
    );

    if (!storedToken) {
        throw new ApiError(401, "Refresh token not found.");
    }

    if (storedToken.expiresAt < new Date()) {
        throw new ApiError(401, "Refresh token has expired.");
    }

    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    return {
        message: "Access token refreshed successfully.",
        accessToken,
    };
};

export const forgotPassword = async (email) => {
    if (!email) {
        throw new ApiError(400, "Email is required.");
    }

    const normalizedEmail = cleanEmail(email);

    // Find User
    const user = await findUserByEmail(normalizedEmail);

    // Generic Response
    if (!user || !user.isEmailVerified) {
        return {
            message:
                "If an account exists with this email, a verification code has been sent.",
        };
    }

    // Resend Limit (30 Seconds)
    if (
        user.passwordReset?.lastSentAt &&
        Date.now() - new Date(user.passwordReset.lastSentAt).getTime() < 30 * 1000
    ) {
        throw new ApiError(
            429,
            "Please wait before requesting another verification code."
        );
    }

    const verificationCode = generateVerificationCode();
    const codeHash = hashVerificationCode(verificationCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await updatePasswordResetData(
        user._id,
        codeHash,
        expiresAt,
        new Date()
    );

    await sendPasswordResetEmail(
        user.email,
        user.fullName,
        verificationCode
    );

    return {
        message:
            "If an account exists with this email, a verification code has been sent.",
    };
};

export const verifyResetCode = async (email, code) => {
    if (!email || !code) {
        throw new ApiError(
            400,
            "Email and verification code are required."
        );
    }

    const normalizedEmail = cleanEmail(email);

    const user = await findUserByEmailForPasswordReset(normalizedEmail);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (!user.passwordReset?.codeHash) {
        throw new ApiError(
            400,
            "No pending password reset request found."
        );
    }

    if (user.passwordReset.expiresAt < new Date()) {
        throw new ApiError(
            400,
            "Verification code has expired."
        );
    }

    if (user.passwordReset.attempts >= 5) {
        await clearPasswordResetData(user._id);

        throw new ApiError(
            429,
            "Too many incorrect attempts. Please request a new verification code."
        );
    }

    const codeHash = hashVerificationCode(code);

    if (codeHash !== user.passwordReset.codeHash) {
        await incrementPasswordResetAttempts(user._id);

        throw new ApiError(
            401,
            "Invalid verification code."
        );
    }

    const { token: resetToken, resetTokenId } = generatePasswordResetToken({
        id: user._id,
        email: user.email,
        purpose: "password-reset",
    });

    await updatePasswordResetData(
        user._id,
        user.passwordReset.codeHash,
        user.passwordReset.expiresAt,
        user.passwordReset.lastSentAt,
        resetTokenId
    );

    return {
        message: "Verification successful.",
        resetToken,
    };
};

export const resetPassword = async (
    resetToken,
    newPassword,
    confirmPassword
) => {
    if (!resetToken || !newPassword || !confirmPassword) {
        throw new ApiError(
            400,
            "Reset token, new password and confirm password are required."
        );
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "Passwords do not match."
        );
    }

    validatePasswordStrength(newPassword);

    const payload = verifyPasswordResetToken(resetToken);

    if (payload.purpose !== "password-reset") {
        throw new ApiError(
            401,
            "Invalid password reset token."
        );
    }

    const user = await findUserById(payload.id);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (
        !user.passwordReset?.resetTokenId ||
        user.passwordReset.resetTokenId !== payload.jti ||
        !user.passwordReset?.codeHash
    ) {
        throw new ApiError(
            401,
            "Password reset session has expired or has already been used."
        );
    }

    const isSamePassword = await comparePassword(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password must be different from your current password."
        );
    }

    const hashedPassword = await hashPassword(newPassword);

    await updatePassword(user._id, hashedPassword);
    await clearPasswordResetData(user._id);
    await removeAllRefreshTokens(user._id);

    return {
        message: "Password reset successfully. Please login again.",
    };
};