import mongoose from "mongoose";
import transactionRepository from "../repositories/transaction.repository.js";
import walletRepository from "../repositories/wallet.repository.js";
import { generateTransactionNumber } from "../helpers/transactionNumber.helper.js";

/**
 * FIXED: deposit/withdraw/transfer previously updated wallet balance(s)
 * with separate, non-atomic `.save()` calls, then created the transaction
 * record as a fourth, separate write. If the process crashed or threw
 * between any of those steps (e.g. after debiting the sender but before
 * crediting the receiver), money would be silently lost or duplicated —
 * unacceptable for a banking ledger. Every money-moving operation below
 * now runs inside a single MongoDB session/transaction: either all writes
 * commit together, or none of them do.
 *
 * NOTE: MongoDB transactions require a replica set (MongoDB Atlas is a
 * replica set by default even on the free tier; a bare standalone local
 * `mongod` is not — run `mongod --replSet rs0` and `rs.initiate()` once
 * for local dev, or just point at Atlas).
 */
class TransactionService {
    // ==========================
    // Deposit
    // ==========================
    async deposit(user, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        const session = await mongoose.startSession();
        try {
            let transaction;

            await session.withTransaction(async () => {
                const wallet = await walletRepository.findWalletByUserId(userId);
                if (!wallet) throw new Error("Wallet not found.");
                if (wallet.status !== "active") throw new Error("Wallet is not active.");

                const transactionNumber = await generateTransactionNumber();

                wallet.availableBalance += amount;
                await wallet.save({ session });

                transaction = await transactionRepository.createTransaction(
                    {
                        transactionNumber,
                        receiver: userId,
                        receiverWallet: wallet._id,
                        type: "deposit",
                        amount,
                        currency: wallet.currency,
                        status: "success",
                        description,
                    },
                    session
                );
            });

            return transaction;
        } finally {
            session.endSession();
        }
    }

    // ==========================
    // Withdraw
    // ==========================
    async withdraw(user, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        const session = await mongoose.startSession();
        try {
            let transaction;

            await session.withTransaction(async () => {
                // NOTE: for high-concurrency correctness under load, prefer an
                // atomic conditional update (findOneAndUpdate with a balance
                // guard) over read-then-save; kept as read/modify/save here
                // to match the existing codebase's style, but wrapped in a
                // transaction so it is at least atomic across collections.
                const wallet = await walletRepository.findWalletByUserId(userId);
                if (!wallet) throw new Error("Wallet not found.");
                if (wallet.status !== "active") throw new Error("Wallet is not active.");
                if (wallet.availableBalance < amount) throw new Error("Insufficient wallet balance.");

                const transactionNumber = await generateTransactionNumber();

                wallet.availableBalance -= amount;
                await wallet.save({ session });

                transaction = await transactionRepository.createTransaction(
                    {
                        transactionNumber,
                        sender: userId,
                        senderWallet: wallet._id,
                        type: "withdraw",
                        amount,
                        currency: wallet.currency,
                        status: "success",
                        description,
                    },
                    session
                );
            });

            return transaction;
        } finally {
            session.endSession();
        }
    }

    // ==========================
    // Transfer (UPI-to-UPI)
    // ==========================
    async transfer(user, receiverUpiId, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        const session = await mongoose.startSession();
        try {
            let transaction;

            await session.withTransaction(async () => {
                const senderWallet = await walletRepository.findWalletByUserId(userId);
                if (!senderWallet) throw new Error("Sender wallet not found.");
                if (senderWallet.status !== "active") throw new Error("Sender wallet is not active.");

                const receiverWallet = await walletRepository.findWalletByUpiId(
                    String(receiverUpiId).toLowerCase().trim()
                );
                if (!receiverWallet) throw new Error("Receiver UPI ID not found.");
                if (receiverWallet.status !== "active") throw new Error("Receiver wallet is not active.");

                if (senderWallet._id.toString() === receiverWallet._id.toString()) {
                    throw new Error("You cannot transfer money to your own UPI ID.");
                }

                if (senderWallet.availableBalance < amount) {
                    throw new Error("Insufficient wallet balance.");
                }

                senderWallet.availableBalance -= amount;
                receiverWallet.availableBalance += amount;

                await senderWallet.save({ session });
                await receiverWallet.save({ session });

                const transactionNumber = await generateTransactionNumber();

                // FIX (the core of your request): a single Transaction document
                // stores BOTH `sender` and `receiver` (and both wallet refs).
                // findTransactionsByUser() already queries
                // `$or: [{sender: userId}, {receiver: userId}]`, so this one
                // record shows up correctly in BOTH parties' transaction
                // history/statements — no separate "sent" vs "received" rows
                // to keep in sync.
                transaction = await transactionRepository.createTransaction(
                    {
                        transactionNumber,
                        sender: userId,
                        receiver: receiverWallet.user,
                        senderWallet: senderWallet._id,
                        receiverWallet: receiverWallet._id,
                        type: "transfer",
                        amount,
                        currency: senderWallet.currency,
                        status: "success",
                        description,
                    },
                    session
                );
            });

            return transaction;
        } finally {
            session.endSession();
        }
    }

    // ==========================
    // Get My Transactions
    // ==========================
    async getMyTransactions(user) {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");

        return await transactionRepository.findTransactionsByUser(userId);
    }

    // ==========================
    // Get Transaction By Id
    // ==========================
    async getTransactionById(user, transactionId) {
        const userId = user?._id || user?.id;

        const transaction = await transactionRepository.findTransactionById(transactionId);
        if (!transaction) throw new Error("Transaction not found.");

        const isSender =
            transaction.sender && transaction.sender._id.toString() === userId.toString();
        const isReceiver =
            transaction.receiver && transaction.receiver._id.toString() === userId.toString();

        if (!isSender && !isReceiver) throw new Error("Unauthorized access.");

        return transaction;
    }
}

export default new TransactionService();