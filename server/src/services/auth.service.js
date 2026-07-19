import ApiError from "../utils/ApiError.js";

import {
    createUser,
    emailExists,
    phoneExists,
} from "../repositories/auth.repository.js";

import { hashPassword } from "../helpers/bcrypt.helper.js";

import { validatePasswordStrength } from "../helpers/password.helper.js";

import { generateRandomToken } from "../helpers/token.helper.js";

import { sendVerificationEmail } from "./email.service.js";

/**
 * Register a new user.
 *
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const registerUser = async (userData) => {

    const {
        fullName,
        email,
        phone,
        password,
    } = userData;

    // Check if email already exists.
    if (await emailExists(email)) {
        throw new ApiError(
            409,
            "Email is already registered."
        );
    }

    // Check if phone number already exists.
    if (await phoneExists(phone)) {
        throw new ApiError(
            409,
            "Phone number is already registered."
        );
    }

    // Validate password strength.
    validatePasswordStrength(password);

    // Hash password.
    const hashedPassword = await hashPassword(password);

    // Generate email verification token.
    const verificationToken = generateRandomToken();

    // Token expiry (30 minutes).
    const verificationExpiresAt = new Date(
        Date.now() + 30 * 60 * 1000
    );

    // Create user.
    const user = await createUser({
        fullName,
        email,
        phone,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
        isEmailVerified: false,
    });

    // Send verification email.
    await sendVerificationEmail(
        email,
        verificationToken
    );

    // Remove sensitive data before returning.
    user.password = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiresAt = undefined;

    return {
        success: true,
        message:
            "Registration successful. Please verify your email.",
        user,
    };

};

export const login = async (email, password) => {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return {
        token,
        user,
    };
};