import crypto from "crypto";

// ======================================================
// Configuration
// ======================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is missing in environment variables.");
}

const KEY = Buffer.from(ENCRYPTION_KEY, "hex");

if (KEY.length !== 32) {
    throw new Error(
        "ENCRYPTION_KEY must be exactly 32 bytes (64 hexadecimal characters)."
    );
}

// ======================================================
// Encrypt
// ======================================================

export const encrypt = (plainText) => {
    try {
        if (plainText === undefined || plainText === null) {
            throw new Error("Value to encrypt is required.");
        }

        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

        const encrypted = Buffer.concat([
            cipher.update(String(plainText), "utf8"),
            cipher.final(),
        ]);

        const authTag = cipher.getAuthTag();

        return [
            iv.toString("hex"),
            authTag.toString("hex"),
            encrypted.toString("hex"),
        ].join(":");
    } catch (error) {
        throw new Error("Failed to encrypt data.");
    }
};

// ======================================================
// Decrypt
// ======================================================

export const decrypt = (encryptedText) => {
    try {
        if (!encryptedText) {
            throw new Error("Encrypted value is required.");
        }

        const parts = encryptedText.split(":");

        if (parts.length !== 3) {
            throw new Error("Invalid encrypted payload.");
        }

        const [ivHex, authTagHex, encryptedHex] = parts;

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            KEY,
            Buffer.from(ivHex, "hex")
        );

        decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedHex, "hex")),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    } catch (error) {
        throw new Error("Failed to decrypt data.");
    }
};