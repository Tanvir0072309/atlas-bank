import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user,
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};

export const login = async (req, res) => {
    try {
        const result = await authService.login(
            req.body.email,
            req.body.password
        );

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

//  New Verify Email Controller
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const result = await authService.verifyEmailToken(token);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            ...result,
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Verification failed.",
        });
    }
};