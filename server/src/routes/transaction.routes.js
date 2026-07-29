import express from "express";
import transactionController from "../controllers/transaction.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ==========================
// Transaction Routes
// ==========================

// Deposit Money
router.post(
    "/deposit",
    protect,
    transactionController.deposit
);

// Withdraw Money
router.post(
    "/withdraw",
    protect,
    transactionController.withdraw
);

// Transfer Money (UPI-to-UPI)
router.post(
    "/transfer",
    protect,
    transactionController.transfer
);

// Bank Account -> Wallet Transfer
router.post(
    "/bank-transfer",
    protect,
    transactionController.bankTransfer
);

// Get My Transactions
router.get(
    "/",
    protect,
    transactionController.getMyTransactions
);

// Get Transaction By Id
router.get(
    "/:transactionId",
    protect,
    transactionController.getTransactionById
);

export default router;