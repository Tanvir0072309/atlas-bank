import Joi from "joi";

const objectId = Joi.string()
    .hex()
    .length(24)
    .messages({
        "string.base": "Invalid account id.",
        "string.hex": "Invalid account id.",
        "string.length": "Invalid account id.",
    });

// ==========================
// Deposit
// ==========================
export const depositValidator = Joi.object({
    accountId: objectId.required().messages({
        "any.required": "Please select a bank account to add money from.",
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

// ==========================
// Withdraw
// ==========================
export const withdrawValidator = Joi.object({
    accountId: objectId.required().messages({
        "any.required": "Please select a bank account to send money to.",
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