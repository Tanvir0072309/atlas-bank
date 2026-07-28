import crypto from "crypto";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


export const generateVerificationCode = () => {
    let code = "";

    for (let i = 0; i < 6; i++) {
        const randomIndex = crypto.randomInt(0, CHARACTERS.length);
        code += CHARACTERS[randomIndex];
    }

    return code;
};


export const hashVerificationCode = (code) => {
    const normalized = String(code ?? "").trim().toUpperCase();
    return crypto.createHash("sha256").update(normalized).digest("hex");
};


export const safeCompareHash = (hashA, hashB) => {
    const bufA = Buffer.from(String(hashA ?? ""), "hex");
    const bufB = Buffer.from(String(hashB ?? ""), "hex");

    if (bufA.length !== bufB.length) return false;

    return crypto.timingSafeEqual(bufA, bufB);
};