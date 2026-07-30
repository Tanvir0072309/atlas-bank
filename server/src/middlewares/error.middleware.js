import ApiError from "../utils/apiError.js";

/**
 * Central error handler — every controller in this app forwards errors
 * here via next(error) (either directly, or through asyncHandler).
 * Without this, Express falls back to its default HTML error page,
 * which the frontend can't parse for a message.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong.";

    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // Mongoose duplicate key errors
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        message = `This ${field} is already in use.`;
    }

    // Mongoose invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}.`;
    }

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err instanceof ApiError ? err.errors : undefined,
    });
};

export const notFoundHandler = (req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

export default errorHandler;