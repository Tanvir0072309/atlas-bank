import ApiError from "../utils/apiError.js";

/**
 * NEW: this file existed but was empty (0 bytes) in the original project,
 * even though the User model already defines a `role` enum
 * (customer/employee/manager/admin). Nothing was enforcing it anywhere.
 *
 * Usage: router.patch("/:id", protect, restrictTo("admin", "manager"), controller.fn)
 * Must run AFTER `protect`, since it reads req.user.role set by protect.
 */
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new ApiError(401, "Unauthorized. Please log in first.")
            );
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    "You do not have permission to perform this action."
                )
            );
        }

        next();
    };
};
