import ApiError from "../utils/ApiError.js";
import {
    createUser,
    emailExists,
    phoneExists,
    findUserByVerificationToken,
    markEmailAsVerified,
} from "../repositories/auth.repository.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";
import { validatePasswordStrength } from "../helpers/password.helper.js";
import { generateRandomToken } from "../helpers/token.helper.js";
import { sendVerificationEmail } from "./email.service.js";
import { generateAccessToken } from "../helpers/jwt.helper.js";

/* ---------- 1. REGISTER USER (Ensure 'export const') ---------- */
export const registerUser = async (userData) => {
   
    const { fullName, email, phone, password } = userData;

    if (await emailExists(email)) {
        throw new ApiError(409, "Email is already registered.");
    }

    if (await phoneExists(phone)) {
        throw new ApiError(409, "Phone number is already registered.");
    }

    validatePasswordStrength(password);

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateRandomToken();
    const verificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);


    const user = await createUser({
        fullName,
        email,
        phone,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
        isEmailVerified: false,
    });

    await sendVerificationEmail(email, verificationToken);

    user.password = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiresAt = undefined;

    return user;
};

/* ---------- 2. VERIFY EMAIL TOKEN ---------- */
export const verifyEmailToken = async (token) => {
    if (!token) {
        throw new ApiError(400, "Verification token is required.");
    }

    const user = await findUserByVerificationToken(token);

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification link.");
    }

    if (new Date() > new Date(user.emailVerificationExpiresAt)) {
        throw new ApiError(400, "Verification link has expired. Please request a new one.");
    }

    const updatedUser = await markEmailAsVerified(user._id);

    const accessToken = generateAccessToken({
        id: updatedUser._id,
        email: updatedUser.email,
    });

    return {
        token: accessToken,
        user: updatedUser,
    };
};

/* ---------- 3. LOGIN ---------- */
export const login = async (email, password) => {
    // Aapka login logic yahan...
};