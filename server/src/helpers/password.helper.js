import ApiError from "../utils/apiError.js";
import { SECURITY_CONFIG } from "../config/security.config.js";

const { password: PASSWORD_CONFIG } = SECURITY_CONFIG;

/**
 * Validate Password Strength
 *
 * @param {string} password
 * @returns {boolean}
 */
export const validatePasswordStrength = (password) => {

    if (!password || typeof password !== "string") {
        throw new ApiError(400, "Password is required.");
    }

    if (password.length < PASSWORD_CONFIG.minLength) {
        throw new ApiError(
            400,
            `Password must be at least ${PASSWORD_CONFIG.minLength} characters long.`
        );
    }

    if (password.length > PASSWORD_CONFIG.maxLength) {
        throw new ApiError(
            400,
            `Password cannot exceed ${PASSWORD_CONFIG.maxLength} characters.`
        );
    }

    if (
        PASSWORD_CONFIG.requireUppercase &&
        !/[A-Z]/.test(password)
    ) {
        throw new ApiError(
            400,
            "Password must contain at least one uppercase letter."
        );
    }

    if (
        PASSWORD_CONFIG.requireLowercase &&
        !/[a-z]/.test(password)
    ) {
        throw new ApiError(
            400,
            "Password must contain at least one lowercase letter."
        );
    }

    if (
        PASSWORD_CONFIG.requireNumber &&
        !/\d/.test(password)
    ) {
        throw new ApiError(
            400,
            "Password must contain at least one number."
        );
    }

    if (
        PASSWORD_CONFIG.requireSpecialCharacter &&
        !/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/.test(password)
    ) {
        throw new ApiError(
            400,
            "Password must contain at least one special character."
        );
    }

    if (
        PASSWORD_CONFIG.blockedPasswords.includes(
            password.toLowerCase()
        )
    ) {
        throw new ApiError(
            400,
            "This password is too common. Please choose another password."
        );
    }

    return true;
};