import Joi from "joi";

/**
 * FIXED: the original auth.validator.js contained two no-op pass-through
 * functions (`(req,res,next)=>next()`), and auth.routes.js didn't even
 * import them — so there was ZERO server-side validation on register,
 * login, OTP, or password-reset endpoints. Anything (malformed email,
 * empty password, oversized payloads) reached the service/DB layer
 * directly. Real Joi schemas below, wired in via validate.middleware.js
 * (which already existed, correctly written, but unused for auth).
 */

const PHONE_REGEX = /^[0-9]{10,15}$/;
const OTP_REGEX = /^[A-Za-z0-9]{6}$/; // case-insensitive at the edge; normalized server-side

export const registerSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().trim().lowercase().email().required(),
    phone: Joi.string().trim().pattern(PHONE_REGEX).required().messages({
        "string.pattern.base": "Phone number must be 10-15 digits.",
    }),
    password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required(),
});

export const verifyLoginSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    code: Joi.string().trim().pattern(OTP_REGEX).required().messages({
        "string.pattern.base": "Verification code must be 6 characters.",
    }),
});

export const resendOtpSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
});

export const verifyResetCodeSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    code: Joi.string().trim().pattern(OTP_REGEX).required(),
});

export const resetPasswordSchema = Joi.object({
    resetToken: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
        "any.only": "Passwords do not match.",
    }),
});