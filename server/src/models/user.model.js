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

        // Email Verification Token
        emailVerificationToken: {
            type: String,
            default: null,
        },

        // Verification Token Expiry
        emailVerificationExpiresAt: {
            type: Date,
            default: null,
        },

        loginVerification: {
            codeHash: {
                type: String,
                default: null,
            },

            expiresAt: {
                type: Date,
                default: null,
            },

            attempts: {
                type: Number,
                default: 0,
            },

            lastSentAt: {
                type: Date,
                default: null,
            },
        },

        passwordReset: {
            codeHash: {
                type: String,
                default: null,
            },
            expiresAt: {
                type: Date,
                default: null,
            },
            attempts: {
                type: Number,
                default: 0,
            },
            lastSentAt: {
                type: Date,
                default: null,
            },

            // One-time reset token identifier
            resetTokenId: {
                type: String,
                default: null,
            },
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
        // Refresh Tokens
        // -----------------------

        refreshTokens: [
            {
                tokenHash: {
                    type: String,
                    required: true,
                },

                createdAt: {
                    type: Date,
                    default: Date.now,
                },

                expiresAt: {
                    type: Date,
                    required: true,
                },

                deviceInfo: {
                    type: String,
                    default: "",
                },

                revokedAt: {
                    type: Date,
                    default: null,
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