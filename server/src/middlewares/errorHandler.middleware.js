import ApiError from "../utils/apiError.js";

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

    // FIX: this only logged when NODE_ENV !== "production" — meaning on a
    // real deployment (Render, with NODE_ENV=production) every failing
    // request (deposit/withdraw/transfer, or anything else) returned its
    // JSON error to the client but printed NOTHING in the server logs.
    // That's exactly why nothing showed up in Render logs even though a
    // transaction was failing. Server-side logging should always happen —
    // it's only the response sent to the *client* that should stay generic
    // in production, which this middleware already does correctly.
    console.error(`[${req.method} ${req.originalUrl}]`, err);

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
}
