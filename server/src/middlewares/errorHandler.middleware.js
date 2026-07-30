import ApiError from "../utils/ApiError.js";

/**
 * =====================================================
 * Global Error Handler
 * Every controller uses asyncHandler / try-catch and calls
 * next(error) on failure. Without this, Express falls back
 * to its default HTML error page instead of clean JSON —
 * this middleware makes sure the frontend always gets a
 * proper { success, message } JSON response to read.
 * =====================================================
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
    const statusCode = err instanceof ApiError ? err.statusCode : (err.statusCode || 500);
    const message = err.message || "Something went wrong.";

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
}
