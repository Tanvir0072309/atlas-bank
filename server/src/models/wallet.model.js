import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
    {
        // ==========================
        // Owner
        // ==========================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One User = One Wallet
            index: true,
        },

        // ==========================
        // Wallet Information
        // ==========================
        walletNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        upiId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        availableBalance: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        // ==========================
        // Wallet Status
        // ==========================
        status: {
            type: String,
            enum: [
                "active",
                "blocked",
                "suspended",
            ],
            default: "active",
        },

        // ==========================
        // Soft Delete
        // ==========================
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

export default mongoose.model("Wallet", walletSchema);