import crypto from "crypto";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generate a random 6-character verification code
 */
export const generateVerificationCode = () => {
    let code = "";

    for (let i = 0; i < 6; i++) {
        const randomIndex = crypto.randomInt(
            0,
            CHARACTERS.length
        );

        code += CHARACTERS[randomIndex];
    }

    return code;
};

/**
 * Hash verification code before storing
 */
export const hashVerificationCode = (code) => {
    return crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");
};