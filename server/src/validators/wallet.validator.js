import Joi from "joi";

class WalletValidator {
    updateWalletStatus(body) {
        const schema = Joi.object({
            status: Joi.string()
                .valid(
                    "active",
                    "blocked",
                    "suspended"
                )
                .required()
                .messages({
                    "any.required": "Wallet status is required.",
                    "any.only":
                        "Wallet status must be active, blocked, or suspended.",
                }),
        });

        return schema.validate(body);
    }
}

export default new WalletValidator();