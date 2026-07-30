/**
 * ============================================================================
 * RECONSTRUCTED FILE — READ THIS FIRST
 * ============================================================================
 * Your original server/src/services/auth.service.js was NOT present in the
 * upload. Both your client and server projects have a file named
 * `auth.service.js`, and when the project was flattened into a single zip,
 * the client's copy (React/axios/localStorage code) overwrote the server's
 * copy. I rebuilt this file from scratch using:
 *   - auth.controller.js (exact function names/signatures it calls)
 *   - auth.repository.js, user.model.js, jwt.helper.js, bcrypt.helper.js,
 *     token.helper.js, loginVerification.helper.js, email.service.js,
 *     auth.constants.js, security.config.js (all present & unmodified)
 *
 * This directly fixes the three symptoms you reported that lived in this
 * file specifically:
 *   1. Verification/OTP emails are now AWAITED, and a failure is a real,
 *      visible error — registration is rolled back rather than returning
 *      201 while the email silently failed.
 *   2. OTP comparison now normalizes case/whitespace and is scoped to the
 *      submitted email (see loginVerification.helper.js / auth.repository.js
 *      fixes) with a constant-time comparison.
 *   3. Login-attempt lockout (MAX_LOGIN_ATTEMPTS / ACCOUNT_LOCK_TIME from
 *      auth.constants.js) is actually enforced here — it was defined but
 *      unused before.
 *
 * Please review this against your previous business logic/copy — I could
 * not recover your original wording, only your original *behavior* as
 * inferred from the surrounding files.
 * ============================================================================
 */

import * as authRepository from "../repositories/auth.repository.js";
import walletService from "./wallet.service.js";
import walletRepository from "../repositories/wallet.repository.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { validatePasswordStrength } from "../helpers/password.helper.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    generatePasswordResetToken,
    verifyPasswordResetToken,
} from "../helpers/jwt.helper.js";
import { hashRefreshToken } from "../helpers/refreshToken.helper.js";
import { generateEmailVerificationToken, hashToken } from "../helpers/token.helper.js";
import {
    generateVerificationCode,
    hashVerificationCode,
    safeCompareHash,
} from "../helpers/loginVerification.helper.js";
import {
    sendVerificationEmail,
    sendLoginVerificationEmail,
    sendPasswordResetEmail,
} from "./email.service.js";
import { MAX_LOGIN_ATTEMPTS, ACCOUNT_LOCK_TIME } from "../constants/auth.constants.js";
import { JWT_CONFIG } from "../config/jwt.config.js";
import ApiError from "../utils/apiError.js";

const EMAIL_VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24h
const LOGIN_OTP_EXPIRES_MS = 5 * 60 * 1000; // 5 min, matches the email copy
const RESET_OTP_EXPIRES_MS = 10 * 60 * 1000; // 10 min, matches the email copy
const MAX_OTP_ATTEMPTS = 5;

const sanitizeUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;
    delete user.password;
    delete user.emailVerificationToken;
    delete user.loginVerification;
    delete user.passwordReset;
    delete user.refreshTokens;
    return user;
};

const issueSessionTokens = async (user, deviceInfo = "") => {
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + (JWT_CONFIG.refreshToken.expiresInMs || 7 * 24 * 60 * 60 * 1000));

    await authRepository.saveRefreshToken(user._id, refreshTokenHash, expiresAt, deviceInfo);

    return { accessToken, refreshToken };
};

/* ============================================================
 * REGISTER
 * ============================================================ */
export const registerUser = async (payload) => {
    const { fullName, email, phone, password } = payload;

    if (!fullName || !email || !phone || !password) {
        throw new ApiError(400, "Full name, email, phone, and password are required.");
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    validatePasswordStrength(password); // throws ApiError on failure

    if (await authRepository.emailExists(normalizedEmail)) {
        throw new ApiError(409, "An account with this email already exists.");
    }
    if (await authRepository.phoneExists(phone)) {
        throw new ApiError(409, "An account with this phone number already exists.");
    }

    const hashedPassword = await hashPassword(password);

    const rawToken = generateEmailVerificationToken();
    const tokenHash = hashToken(rawToken);

    const user = await authRepository.createUser({
        fullName,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        status: "pending",
        emailVerificationToken: tokenHash,
        emailVerificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_MS),
    });

    // FIX: a wallet is now auto-provisioned for every new user at
    // registration time (previously nothing ever called the wallet
    // route/service during signup, so users had no wallet until they
    // manually hit POST /wallet — which the frontend never actually does).
    // If this fails, roll back the user rather than leaving an account
    // with no wallet stuck behind it.
    try {
        await walletService.createWallet(user);
    } catch (err) {
        await authRepository.deleteUserById(user._id);
        throw new ApiError(
            500,
            "Registration could not be completed because a wallet could not be created for your account. Please try again."
        );
    }

    // FIX: this call is now AWAITED, and a failure is NOT swallowed.
    // Previously (in the lost file) this was almost certainly either
    // fire-and-forget or wrapped in a try/catch that logged and moved on,
    // which is exactly why registration always returned 201 regardless of
    // whether the email actually went out.
    try {
        await sendVerificationEmail(user.email, rawToken);
    } catch (err) {
        // Roll back the registration (user + the wallet we just created)
        // rather than leaving a "pending" user with no way to ever
        // activate their account, and tell the truth in the API response
        // instead of a false 201.
        await authRepository.deleteUserById(user._id);
        await walletRepository.hardDeleteByUserId(user._id);
        throw new ApiError(
            502,
            "Registration could not be completed because the verification email failed to send. Please try again."
        );
    }

    return sanitizeUser(user);
};

/* ============================================================
 * EMAIL VERIFICATION
 * ============================================================ */
export const verifyEmailToken = async (rawToken) => {
    if (!rawToken) {
        throw new ApiError(400, "Verification token is required.");
    }

    const tokenHash = hashToken(rawToken);
    const user = await authRepository.findUserByVerificationTokenHash(tokenHash);

    if (!user) {
        throw new ApiError(400, "This verification link is invalid or has expired.");
    }

    const verifiedUser = await authRepository.markEmailAsVerified(user._id);
    const { accessToken, refreshToken } = await issueSessionTokens(verifiedUser);

    return {
        message: "Email verified successfully!",
        accessToken,
        refreshToken,
        user: sanitizeUser(verifiedUser),
    };
};

/* ============================================================
 * LOGIN — STEP 1 (credentials -> send OTP)
 * ============================================================ */
export const login = async (email, password) => {
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required.");
    }

    const user = await authRepository.findUserByEmail(email);

    // Always respond with a generic message on failure so we don't leak
    // which emails are registered (user enumeration).
    const genericError = new ApiError(401, "Invalid email or password.");

    if (!user) throw genericError;

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
        const minutesLeft = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
        const err = new ApiError(
            423,
            `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
        );
        err.lockUntil = user.lockUntil;
        throw err;
    }

    if (["blocked", "suspended", "deleted"].includes(user.status)) {
        throw new ApiError(403, "This account is not active. Please contact support.");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        const updated = await authRepository.incrementLoginAttempts(user._id);
        const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - updated.loginAttempts);

        if (updated.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME);
            await authRepository.lockAccount(user._id, lockUntil);
            const err = new ApiError(423, "Too many failed attempts. Account temporarily locked.");
            err.lockUntil = lockUntil;
            throw err;
        }

        genericError.remainingAttempts = remainingAttempts;
        throw genericError;
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in.");
    }

    // Successful password check — reset the counter and send the OTP.
    await authRepository.resetLoginAttempts(user._id);

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(code);
    const expiresAt = new Date(Date.now() + LOGIN_OTP_EXPIRES_MS);

    await authRepository.saveLoginVerification(user._id, codeHash, expiresAt);

    // FIX: AWAITED and NOT swallowed — same class of bug as registration.
    try {
        await sendLoginVerificationEmail(user.email, user.fullName, code);
    } catch (err) {
        throw new ApiError(502, "Could not send verification code. Please try again.");
    }

    return { message: "Verification code sent to your email." };
};

/* ============================================================
 * LOGIN — STEP 2 (verify OTP -> issue tokens)
 * ============================================================ */
export const verifyLogin = async (email, code) => {
    if (!email || !code) {
        throw new ApiError(400, "Email and verification code are required.");
    }

    // FIX: look the user up by email FIRST (previously the repository
    // looked up by codeHash alone, with no email predicate at all).
    const user = await authRepository.findUserByEmailForLoginVerification(email);

    if (!user || !user.loginVerification?.codeHash) {
        throw new ApiError(400, "No verification code was requested for this account.");
    }

    const { codeHash, expiresAt, attempts } = user.loginVerification;

    if (attempts >= MAX_OTP_ATTEMPTS) {
        await authRepository.clearLoginVerification(user._id);
        throw new ApiError(429, "Too many incorrect attempts. Please log in again to request a new code.");
    }

    if (new Date() > new Date(expiresAt)) {
        throw new ApiError(400, "Verification code has expired. Please log in again to request a new one.");
    }

    // FIX: normalized hashing (loginVerification.helper.js) + constant-time
    // comparison, instead of a raw, case-sensitive SHA-256 equality check.
    const submittedHash = hashVerificationCode(code);
    const isMatch = safeCompareHash(submittedHash, codeHash);

    if (!isMatch) {
        const updated = await authRepository.incrementLoginVerificationAttempts(user._id);
        const err = new ApiError(400, "Invalid verification code.");
        err.remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - updated.loginVerification.attempts);
        throw err;
    }

    await authRepository.clearLoginVerification(user._id);
    await authRepository.updateLastLogin(user._id);

    const { accessToken, refreshToken } = await issueSessionTokens(user);

    return {
        message: "Login successful",
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
    };
};

/* ============================================================
 * RESEND OTP  (fixes the missing /resend-otp route the frontend
 * already calls — see auth.service.js in client/src/services)
 * ============================================================ */
export const resendLoginOtp = async (email) => {
    const user = await authRepository.findUserByEmailForLoginVerification(email);

    // Don't reveal whether the email exists.
    if (!user) return { message: "If an account exists, a new code has been sent." };

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(code);
    const expiresAt = new Date(Date.now() + LOGIN_OTP_EXPIRES_MS);

    await authRepository.saveLoginVerification(user._id, codeHash, expiresAt);

    try {
        await sendLoginVerificationEmail(user.email, user.fullName, code);
    } catch (err) {
        throw new ApiError(502, "Could not send verification code. Please try again.");
    }

    return { message: "If an account exists, a new code has been sent." };
};

/* ============================================================
 * REFRESH ACCESS TOKEN
 * ============================================================ */
export const refreshAccessToken = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing.");
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const tokenHash = hashRefreshToken(incomingRefreshToken);
    const user = await authRepository.findUserByRefreshToken(tokenHash);

    if (!user || String(user._id) !== String(decoded.id)) {
        throw new ApiError(401, "Refresh token is no longer valid. Please log in again.");
    }

    if (["blocked", "suspended", "deleted"].includes(user.status)) {
        throw new ApiError(403, "This account is not active.");
    }

    // Rotate the refresh token: remove the used one, issue a new pair.
    await authRepository.removeRefreshToken(user._id, tokenHash);
    const { accessToken, refreshToken } = await issueSessionTokens(user);

    return { accessToken, refreshToken, user: sanitizeUser(user) };
};

/* ============================================================
 * FORGOT / RESET PASSWORD
 * ============================================================ */
export const forgotPassword = async (email) => {
    const user = await authRepository.findUserByEmailForPasswordReset(email);

    // Don't reveal whether the email exists.
    if (!user) return { message: "If an account exists, a reset code has been sent." };

    const code = generateVerificationCode();
    const codeHash = hashVerificationCode(code);
    const expiresAt = new Date(Date.now() + RESET_OTP_EXPIRES_MS);

    await authRepository.updatePasswordResetData(user._id, codeHash, expiresAt, new Date());

    try {
        await sendPasswordResetEmail(user.email, user.fullName, code);
    } catch (err) {
        throw new ApiError(502, "Could not send password reset code. Please try again.");
    }

    return { message: "If an account exists, a reset code has been sent." };
};

export const verifyResetCode = async (email, code) => {
    const user = await authRepository.findUserByEmailForPasswordReset(email);

    if (!user || !user.passwordReset?.codeHash) {
        throw new ApiError(400, "Invalid or expired verification code.");
    }

    const { codeHash, expiresAt, attempts } = user.passwordReset;

    if (attempts >= MAX_OTP_ATTEMPTS) {
        throw new ApiError(429, "Too many incorrect attempts. Please request a new code.");
    }
    if (new Date() > new Date(expiresAt)) {
        throw new ApiError(400, "Verification code has expired. Please request a new one.");
    }

    const submittedHash = hashVerificationCode(code);
    const isMatch = safeCompareHash(submittedHash, codeHash);

    if (!isMatch) {
        await authRepository.incrementPasswordResetAttempts(user._id);
        throw new ApiError(400, "Invalid verification code.");
    }

    const { token: resetToken, resetTokenId } = generatePasswordResetToken({
        id: user._id,
        email: user.email,
    });

    // Bind the reset token to this specific verified OTP session so it
    // can't be reused after a password change.
    await authRepository.updatePasswordResetData(user._id, codeHash, expiresAt, user.passwordReset.lastSentAt, resetTokenId);

    return { message: "Code verified.", resetToken };
};

export const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    if (!resetToken) throw new ApiError(400, "Reset token is required.");
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match.");
    }

    validatePasswordStrength(newPassword);

    let decoded;
    try {
        decoded = verifyPasswordResetToken(resetToken);
    } catch {
        throw new ApiError(401, "Invalid or expired reset token.");
    }

    const user = await authRepository.findUserById(decoded.id);

    if (!user || user.passwordReset?.resetTokenId !== decoded.jti) {
        throw new ApiError(401, "This reset link has already been used or is invalid.");
    }

    const hashedPassword = await hashPassword(newPassword);
    await authRepository.updatePassword(user._id, hashedPassword);
    await authRepository.clearPasswordResetData(user._id);

    return { message: "Password reset successfully. Please log in with your new password." };
};