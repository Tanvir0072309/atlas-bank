import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // -----------------------
        // Personal Information
        // -----------------------

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        // -----------------------
        // Authentication
        // -----------------------

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },

        role: {
            type: String,
            enum: ["customer", "employee", "manager", "admin"],
            default: "customer",
        },

        // -----------------------
        // Verification
        // -----------------------

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        // -----------------------
        // Account Status
        // -----------------------

        status: {
            type: String,
            enum: [
                "pending",
                "active",
                "blocked",
                "suspended",
                "deleted",
            ],
            default: "pending",
        },

        // -----------------------
        // Login Security
        // -----------------------

        loginAttempts: {
            type: Number,
            default: 0,
        },

        lockUntil: {
            type: Date,
            default: null,
        },

        lastLogin: {
            type: Date,
            default: null,
        },

        lastPasswordChangedAt: {
            type: Date,
            default: null,
        },

        // -----------------------
        // Refresh Token
        // -----------------------

        refreshTokens: [
            {
                token: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("User", userSchema);