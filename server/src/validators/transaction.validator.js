import Joi from "joi";

// ==========================
// Deposit
// ==========================
export const depositValidator = Joi.object({
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Amount must be a number.",
            "number.positive": "Amount must be greater than zero.",
            "any.required": "Amount is required.",
        }),

    description: Joi.string()
        .trim()
        .max(250)
        .allow("")
        .optional(),
});

// ==========================
// Withdraw
// ==========================
export const withdrawValidator = Joi.object({
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Amount must be a number.",
            "number.positive": "Amount must be greater than zero.",
            "any.required": "Amount is required.",
        }),

    description: Joi.string()
        .trim()
        .max(250)
        .allow("")
        .optional(),
});

// ==========================
// Transfer
// ==========================
export const transferValidator = Joi.object({
    receiverUpiId: Joi.string()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Receiver UPI ID is required.",
            "any.required": "Receiver UPI ID is required.",
        }),

    amount: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Amount must be a number.",
            "number.positive": "Amount must be greater than zero.",
            "any.required": "Amount is required.",
        }),

    description: Joi.string()
        .trim()
        .max(250)
        .allow("")
        .optional(),
});