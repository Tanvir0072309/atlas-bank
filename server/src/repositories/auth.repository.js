import User from "../models/user.model.js";

/* ---------- CREATE ---------- */

export const createUser = async (userData) => {
    return await User.create(userData);
};

/* ---------- FIND ---------- */

export const findUserByEmail = async (email) => {
    return await User.findOne({ email: email?.toLowerCase().trim() }).select("+password");
};

export const findUserByPhone = async (phone) => {
    return await User.findOne({ phone }).select("+password");
};

export const findUserById = async (userId) => {
    return await User.findById(userId).select("+password");
};

/* ---------- DELETE / DEACTIVATE ---------- */

// Hard delete — used when we must roll back a registration whose
// verification email failed to send (see auth.service.js:registerUser).
export const deleteUserById = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

/* ---------- EMAIL VERIFICATION (FIXED: token is now looked up by HASH) ---------- */

/**
 * FIXED: previously the raw verification token was stored in MongoDB and
 * matched by exact value (findUserByVerificationToken). That meant anyone
 * with read access to the users collection (a leaked backup, a DBA, a
 * NoSQL-injection bug elsewhere) could activate any pending account
 * without ever touching the email. We now store only the SHA-256 hash
 * of the token (the raw token only ever exists in the emailed link),
 * consistent with how passwordReset.codeHash is already handled.
 */
export const findUserByVerificationTokenHash = async (tokenHash) => {
    return await User.findOne({
        emailVerificationToken: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() },
    });
};

export const setEmailVerificationToken = async (userId, tokenHash, expiresAt) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                emailVerificationToken: tokenHash,
                emailVerificationExpiresAt: expiresAt,
            },
        },
        { new: true }
    );
};

export const markEmailAsVerified = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            isEmailVerified: true,
            status: "active",
            $unset: {
                emailVerificationToken: 1,
                emailVerificationExpiresAt: 1,
            },
        },
        { new: true }
    ).select("-password");
};

/* ---------- EXISTS ---------- */

export const emailExists = async (email) => {
    return await User.exists({ email: email?.toLowerCase().trim() });
};

export const phoneExists = async (phone) => {
    return await User.exists({ phone });
};

/* ---------- UPDATE ---------- */

export const updateLastLogin = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { $set: { lastLogin: new Date() } },
        { new: true, runValidators: true }
    ).select("-password");
};

/* ---------- LOGIN SECURITY ---------- */

export const incrementLoginAttempts = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { $inc: { loginAttempts: 1 } },
        { new: true }
    );
};

export const resetLoginAttempts = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { loginAttempts: 0, lockUntil: null },
        { new: true }
    );
};

export const lockAccount = async (userId, lockUntil) => {
    return await User.findByIdAndUpdate(userId, { lockUntil }, { new: true });
};

/* ---------- REFRESH TOKEN ---------- */

export const saveRefreshToken = async (userId, tokenHash, expiresAt, deviceInfo = "") => {
    return await User.findByIdAndUpdate(
        userId,
        { $push: { refreshTokens: { tokenHash, expiresAt, deviceInfo } } },
        { new: true }
    );
};

export const removeRefreshToken = async (userId, tokenHash) => {
    return await User.findByIdAndUpdate(
        userId,
        { $pull: { refreshTokens: { tokenHash } } },
        { new: true }
    );
};

export const removeAllRefreshTokens = async (userId) => {
    return await User.findByIdAndUpdate(userId, { refreshTokens: [] }, { new: true });
};

export const findUserByRefreshToken = async (tokenHash) => {
    return await User.findOne({
        "refreshTokens.tokenHash": tokenHash,
        "refreshTokens.revokedAt": null,
    });
};

/**
 * Save Login Verification Code (OTP)
 */
export const saveLoginVerification = async (userId, codeHash, expiresAt) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            loginVerification: {
                codeHash,
                expiresAt,
                attempts: 0,
                lastSentAt: new Date(),
            },
        },
        { new: true }
    );
};

/**
 * FIXED: this used to look up the user by codeHash ALONE
 * (findUserByLoginVerification), with no email predicate — meaning the
 * `email` submitted by the client was never actually used to constrain
 * who could log in, and every failure (wrong code, expired code, wrong
 * user, whitespace/case mismatch) collapsed into the same generic error
 * with nothing to distinguish them by. We now always look the user up
 * by email FIRST, then compare the code hash against that specific
 * user's stored value in the service layer (see auth.service.js).
 */
export const findUserByEmailForLoginVerification = async (email) => {
    return await User.findOne({ email: email?.toLowerCase().trim() });
};

export const incrementLoginVerificationAttempts = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { $inc: { "loginVerification.attempts": 1 } },
        { new: true }
    );
};

export const clearLoginVerification = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            loginVerification: {
                codeHash: null,
                expiresAt: null,
                attempts: 0,
                lastSentAt: null,
            },
        },
        { new: true }
    );
};

/* ---------- PASSWORD RESET ---------- */

export const updatePasswordResetData = async (
    userId,
    codeHash,
    expiresAt,
    lastSentAt,
    resetTokenId = null
) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                "passwordReset.codeHash": codeHash,
                "passwordReset.expiresAt": expiresAt,
                "passwordReset.attempts": 0,
                "passwordReset.lastSentAt": lastSentAt,
                "passwordReset.resetTokenId": resetTokenId,
            },
        },
        { new: true }
    );
};

export const findUserByEmailForPasswordReset = async (email) => {
    return await User.findOne({ email: email?.toLowerCase().trim() });
};

export const clearPasswordResetData = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                "passwordReset.codeHash": null,
                "passwordReset.expiresAt": null,
                "passwordReset.attempts": 0,
                "passwordReset.lastSentAt": null,
                "passwordReset.resetTokenId": null,
            },
        },
        { new: true }
    );
};

export const incrementPasswordResetAttempts = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        { $inc: { "passwordReset.attempts": 1 } },
        { new: true }
    );
};

export const updatePassword = async (userId, hashedPassword) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                password: hashedPassword,
                lastPasswordChangedAt: new Date(),
            },
            // Force logout everywhere on password change — closes the
            // gap where an attacker with a stolen refresh token keeps
            // sessions alive even after the victim resets their password.
            refreshTokens: [],
        },
        { new: true }
    );
};