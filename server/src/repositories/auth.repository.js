import User from "../models/user.model.js";

/* ---------- CREATE ---------- */

export const createUser = async (userData) => {
    return await User.create(userData);
};

/* ---------- FIND ---------- */

export const findUserByEmail = async (email) => {
    return await User.findOne({ email }).select("+password");
};

export const findUserByPhone = async (phone) => {
    return await User.findOne({ phone }).select("+password");
};

export const findUserById = async (userId) => {
    return await User.findById(userId);
};

/* ---------- EMAIL VERIFICATION (VERIFIED & FIXED) ---------- */

export const findUserByVerificationToken = async (token) => {
    return await User.findOne({ emailVerificationToken: token });
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
    return await User.exists({ email });
};

export const phoneExists = async (phone) => {
    return await User.exists({ phone });
};

/* ---------- UPDATE ---------- */

export const updateLastLogin = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                lastLogin: new Date(),
            },
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");
};

/* ---------- LOGIN SECURITY ---------- */

export const incrementLoginAttempts = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $inc: { loginAttempts: 1 },
        },
        { new: true }
    );
};

export const resetLoginAttempts = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            loginAttempts: 0,
            lockUntil: null,
        },
        { new: true }
    );
};

export const lockAccount = async (userId, lockUntil) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            lockUntil,
        },
        { new: true }
    );
};



/* ---------- REFRESH TOKEN ---------- */

export const saveRefreshToken = async (userId, refreshToken) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $push: {
                refreshTokens: {
                    token: refreshToken,
                },
            },
        },
        { new: true }
    );
};

export const removeRefreshToken = async (userId, refreshToken) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $pull: {
                refreshTokens: {
                    token: refreshToken,
                },
            },
        },
        { new: true }
    );
};

export const removeAllRefreshTokens = async (userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            refreshTokens: [],
        },
        { new: true }
    );
};

