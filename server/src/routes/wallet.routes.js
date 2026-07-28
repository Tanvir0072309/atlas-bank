import express from "express";

import walletController from "../controllers/wallet.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================================
// Wallet
// ==========================================

router.post("/", protect, walletController.createWallet);

router.get("/", protect, walletController.getMyWallet);

router.get("/qr", protect, walletController.getWalletQr);

// ==========================================
// Wallet Management
// ==========================================

router.patch(
    "/:walletId/status",
    protect,
    walletController.updateWalletStatus
);

router.delete(
    "/:walletId",
    protect,
    walletController.deleteWallet
);

export default router;