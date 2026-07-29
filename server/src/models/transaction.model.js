import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        transactionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        senderWallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            default: null,
        },

        receiverWallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            default: null,
        },

        // Bank account involved when moving money between a linked
        // bank account and the wallet (Bank → Wallet transfer).
        senderAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            default: null,
        },

        receiverAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            default: null,
        },

        type: {
            type: String,
            enum: [
                "deposit",
                "withdraw",
                "transfer",
                "bank_transfer",
            ],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 1,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "success",
                "failed",
                "cancelled",
            ],
            default: "pending",
        },

        description: {
            type: String,
            trim: true,
            maxlength: 250,
            default: "",
        },

        reference: {
            type: String,
            trim: true,
            default: null,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model(
    "Transaction",
    transactionSchema
);