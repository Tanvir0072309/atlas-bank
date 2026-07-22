import { JWT_CONFIG } from "../config/jwt.config.js";

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
    verifyRefreshToken,
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
    updateLastLogin,
    incrementLoginAttempts,
    lockAccount,
    resetLoginAttempts,
    saveRefreshToken,
    findUserByRefreshToken,
    saveLoginVerification,
    findUserByEmailForLoginVerification,
    clearLoginVerification,
} from "../repositories/auth.repository.js";

import {
    sendVerificationEmail,
    sendLoginVerificationEmail,
} from "./email.service.js";

import ApiError from "../utils/ApiError.js";

import {
    generateVerificationCode,
    hashVerificationCode,
} from "../helpers/loginVerification.helper.js";

/* ---------- 1. REGISTER USER (Ensure 'export const') ---------- */
export const registerUser = async (userData) => {
   
    const { fullName, email, phone, password } = userData;

    if (await emailExists(email)) {
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
        email,
        phone,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
        isEmailVerified: false,
    });

    await sendVerificationEmail(email, verificationToken);

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

    // Find User
    const user = await findUserByEmail(email);

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
    const verificationCode =
        generateVerificationCode();

    // Hash Verification Code
    const codeHash =
        hashVerificationCode(verificationCode);

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
        message:
            "Verification code sent to your email.",
    };
};

export const verifyLogin = async (email, code) => {
    if (!email || !code) {
        throw new ApiError(
            400,
            "Email and verification code are required."
        );
    }

    const user =
        await findUserByEmailForLoginVerification(
            email
        );

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (!user.loginVerification.codeHash) {
        throw new ApiError(
            400,
            "No pending login verification found."
        );
    }

    if (
        user.loginVerification.expiresAt < new Date()
    ) {
        throw new ApiError(
            400,
            "Verification code has expired."
        );
    }

    const codeHash =
        hashVerificationCode(code);

    if (
        codeHash !==
        user.loginVerification.codeHash
    ) {
        throw new ApiError(
            401,
            "Invalid verification code."
        );
    }

    await clearLoginVerification(user._id);

    const accessToken =
        generateAccessToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

    const refreshToken =
        generateRefreshToken({
            id: user._id,
            email: user.email,
            role: user.role,
        });

    const tokenHash =
        hashRefreshToken(refreshToken);

    const expiresAt = new Date(
        Date.now() +
        JWT_CONFIG.refreshToken.expiresInMs
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

    // Verify Refresh Token
    verifyRefreshToken(refreshToken);

    // Hash Refresh Token
    const tokenHash = hashRefreshToken(refreshToken);

    // Find User by Refresh Token
    const user = await findUserByRefreshToken(tokenHash);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token.");
    }

    // Email Verification Check
    if (!user.isEmailVerified) {
        throw new ApiError(
            403,
            "Please verify your email before continuing."
        );
    }

    // Account Status Check
    if (user.status !== "active") {
        throw new ApiError(
            403,
            "Your account is not active. Please contact support."
        );
    }

    // Check Token Exists
    const storedToken = user.refreshTokens.find(
        (token) => token.tokenHash === tokenHash
    );

    if (!storedToken) {
        throw new ApiError(401, "Refresh token not found.");
    }

    // Check Token Expiry
    if (storedToken.expiresAt < new Date()) {
        throw new ApiError(401, "Refresh token has expired.");
    }

    // Generate New Access Token
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