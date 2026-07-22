import crypto from "crypto";

export const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};