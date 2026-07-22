import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

//  Added verification route
router.get("/verify-email", authController.verifyEmail);

router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

router.post("/refresh-token", authController.refreshAccessToken);

router.post(
    "/verify-login",
    authController.verifyLogin
);

export default router;