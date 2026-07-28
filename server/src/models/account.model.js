import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
    {
        // ==========================
        // Owner
        // ==========================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // ==========================
        // Account Information
        // ==========================
        accountHolderName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },

        accountNumber: {
            type: String,
            required: true,
            unique: true,
            select: false, // Hidden by default
        },

        ifscCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        bankName: {
            type: String,
            required: true,
            trim: true,
        },

        branchName: {
            type: String,
            required: true,
            trim: true,
        },

        accountType: {
            type: String,
            enum: ["savings", "current"],
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        // ==========================
        // Balance
        // ==========================
        availableBalance: {
            type: Number,
            required: true,
            default: 10000,
            min: 0,
        },

        // ==========================
        // Status
        // ==========================
        status: {
            type: String,
            enum: [
                "pending",
                "active",
                "blocked",
                "closed",
            ],
            default: "pending",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isPrimary: {
            type: Boolean,
            default: false,
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

// ==========================
// Indexes
// ==========================

accountSchema.index({
    user: 1,
    accountType: 1,
});

export default mongoose.model("Account", accountSchema);