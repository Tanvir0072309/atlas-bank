import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.config.js";
import * as authRepository from "../repositories/auth.repository.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Unauthorized. No token provided.");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_CONFIG.accessToken.secret);
    } catch (err) {
        const message =
            err.name === "TokenExpiredError"
                ? "Session expired. Please log in again."
                : "Invalid token.";
        throw new ApiError(401, message);
    }

    const user = await authRepository.findUserById(decoded.id);

    if (!user) {
        throw new ApiError(401, "Account no longer exists. Please log in again.");
    }

    if (["blocked", "suspended", "deleted"].includes(user.status)) {
        throw new ApiError(403, "Your account is not active. Please contact support.");
    }

    // Invalidate access tokens issued before a password change / forced logout.
    if (
        user.lastPasswordChangedAt &&
        decoded.iat * 1000 < new Date(user.lastPasswordChangedAt).getTime()
    ) {
        throw new ApiError(401, "Session invalidated. Please log in again.");
    }

    req.user = {
        id: user._id,
        _id: user._id, // some controllers/services read `_id`, keep both in sync
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
    };

    next();
});
