import crypto from "crypto";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.config.js";

/**
 * Generate Access Token
 *
 * @param {Object} payload
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        JWT_CONFIG.accessToken.secret,
        {
            expiresIn: JWT_CONFIG.accessToken.expiresIn,
        }
    );
};

/**
 * Generate Refresh Token
 *
 * @param {Object} payload
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        JWT_CONFIG.refreshToken.secret,
        {
            expiresIn: JWT_CONFIG.refreshToken.expiresIn,
        }
    );
};

/**
 * Verify Access Token
 *
 * @param {string} token
 * @returns {Object}
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        JWT_CONFIG.accessToken.secret
    );
};

/**
 * Verify Refresh Token
 *
 * @param {string} token
 * @returns {Object}
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        JWT_CONFIG.refreshToken.secret
    );
};

export const generatePasswordResetToken = (payload) => {
    const resetTokenId = crypto.randomUUID();

    const token = jwt.sign(
        {
            ...payload,
            jti: resetTokenId,
        },
        JWT_CONFIG.passwordResetToken.secret,
        {
            expiresIn:
                JWT_CONFIG.passwordResetToken.expiresIn,
        }
    );

    return {
        token,
        resetTokenId,
    };
};

export const verifyPasswordResetToken = (token) => {
    return jwt.verify(
        token,
        JWT_CONFIG.passwordResetToken.secret
    );
};