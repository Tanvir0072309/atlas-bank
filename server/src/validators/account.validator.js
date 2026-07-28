import Joi from "joi";

// ======================================================
// Common Rules
// ======================================================

const objectId = Joi.string()
    .hex()
    .length(24)
    .messages({
        "string.base": "Invalid account id.",
        "string.hex": "Invalid account id.",
        "string.length": "Invalid account id.",
    });

const accountHolderName = Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
        "string.empty": "Account holder name is required.",
        "string.min": "Account holder name must be at least 3 characters.",
        "string.max": "Account holder name cannot exceed 100 characters.",
    });

const accountNumber = Joi.string()
    .trim()
    .pattern(/^[0-9]{9,18}$/)
    .required()
    .messages({
        "string.empty": "Account number is required.",
        "string.pattern.base":
            "Account number must contain only digits and be between 9 to 18 digits.",
    });

const ifscCode = Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
        "string.empty": "IFSC code is required.",
        "string.pattern.base": "Invalid IFSC code.",
    });

const bankName = Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
        "string.empty": "Bank name is required.",
    });

const branchName = Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
        "string.empty": "Branch name is required.",
    });

const accountType = Joi.string()
    .valid("savings", "current")
    .required()
    .messages({
        "any.only": "Account type must be either savings or current.",
        "any.required": "Account type is required.",
    });

// ======================================================
// Create Account
// ======================================================

export const createAccountSchema = Joi.object({
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    branchName,
    accountType,
});

// ======================================================
// Update Account
// ======================================================

export const updateAccountSchema = Joi.object({
    accountHolderName: accountHolderName.optional(),
    ifscCode: ifscCode.optional(),
    bankName: bankName.optional(),
    branchName: branchName.optional(),
    accountType: accountType.optional(),
});

// ======================================================
// Account ID
// ======================================================

export const accountIdSchema = Joi.object({
    accountId: objectId.required(),
});

// ======================================================
// Set Primary Account
// ======================================================

export const setPrimaryAccountSchema = Joi.object({
    accountId: objectId.required(),
});

// ======================================================
// Delete Account
// ======================================================

export const deleteAccountSchema = Joi.object({
    accountId: objectId.required(),
});