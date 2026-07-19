import crypto from "crypto";

/**
 * Generate a secure random token.
 *
 * @param {number} size - Number of random bytes.
 * @returns {string}
 */
export const generateRandomToken = (size = 32) => {
    return crypto.randomBytes(size).toString("hex");
};

/**
 * Generate Email Verification Token.
 *
 * @returns {string}
 */
export const generateEmailVerificationToken = () => {
    return generateRandomToken();
};

/**
 * Generate Password Reset Token.
 *
 * @returns {string}
 */
export const generatePasswordResetToken = () => {
    return generateRandomToken();
};

/**
 * Generate Account Activation Token.
 *
 * @returns {string}
 */
export const generateAccountActivationToken = () => {
    return generateRandomToken();
};

/**
 * Generate API Key.
 *
 * @returns {string}
 */
export const generateApiKey = () => {
    return generateRandomToken(64);
};

/**
 * Generate Session Token.
 *
 * @returns {string}
 */
export const generateSessionToken = () => {
    return generateRandomToken(48);
};