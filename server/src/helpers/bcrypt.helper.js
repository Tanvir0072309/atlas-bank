import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Hash a plain text password.
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
    if (!password || typeof password !== "string") {
        throw new Error("A valid password is required.");
    }

    return await bcrypt.hash(password, SALT_ROUNDS);
};
/**
 * Compare plain password with hashed password.
 *
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        throw new Error("Password and hashed password are required.");
    }

    return await bcrypt.compare(password, hashedPassword);
};