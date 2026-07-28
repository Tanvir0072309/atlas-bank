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

/**
 * NEW: Hash a raw single-use token before storing it in MongoDB.
 * FIX: the email verification token used to be stored raw and matched by
 * exact value — anyone with DB read access could activate any pending
 * account. The raw token should only ever exist in the emailed link; the
 * database only ever sees this hash.
 *
 * @param {string} rawToken
 * @returns {string}
 */
export const hashToken = (rawToken) => {
    return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
};