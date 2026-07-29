import mongoose from "mongoose";
import transactionRepository from "../repositories/transaction.repository.js";
import walletRepository from "../repositories/wallet.repository.js";
import Account from "../models/account.model.js";
import { generateTransactionNumber } from "../helpers/transactionNumber.helper.js";

class TransactionService {
    // ==========================
    // Bank Account -> Wallet Transfer
    // ==========================
    async bankTransfer(user, accountId, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        const session = await mongoose.startSession();
        try {
            let transaction;

            await session.withTransaction(async () => {
                const account = await Account.findOne({
                    _id: accountId,
                    user: userId,
                    deletedAt: null,
                }).session(session);

                if (!account) throw new Error("Bank account not found.");
                if (account.status !== "active") {
                    throw new Error("This bank account is not active.");
                }
                if (account.availableBalance < amount) {
                    throw new Error("Insufficient bank account balance.");
                }

                const wallet = await walletRepository.findWalletByUserId(
                    userId,
                    session
                );
                if (!wallet) throw new Error("Wallet not found.");
                if (wallet.status !== "active") throw new Error("Wallet is not active.");

                account.availableBalance -= amount;
                wallet.availableBalance += amount;

                await account.save({ session });
                await wallet.save({ session });

                const transactionNumber = await generateTransactionNumber();

                transaction = await transactionRepository.createTransaction(
                    {
                        transactionNumber,
                        sender: userId,
                        receiver: userId,
                        senderAccount: account._id,
                        receiverWallet: wallet._id,
                        type: "bank_transfer",
                        amount,
                        currency: wallet.currency,
                        status: "success",
                        description: description || "Added from Bank",
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
                const wallet = await walletRepository.findWalletByUserId(
                    userId,
                    session
                );
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
    async withdraw(user, amount, description = "", accountId = null) {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        const session = await mongoose.startSession();
        try {
            let transaction;

            await session.withTransaction(async () => {
                const wallet = await walletRepository.findWalletByUserId(
                    userId,
                    session
                );
                if (!wallet) throw new Error("Wallet not found.");
                if (wallet.status !== "active") throw new Error("Wallet is not active.");
                if (wallet.availableBalance < amount) throw new Error("Insufficient wallet balance.");

                let account = null;
                if (accountId) {
                    account = await Account.findOne({
                        _id: accountId,
                        user: userId,
                        deletedAt: null,
                    }).session(session);

                    if (!account) throw new Error("Bank account not found.");
                    if (account.status !== "active") {
                        throw new Error("This bank account is not active.");
                    }
                }

                const transactionNumber = await generateTransactionNumber();

                wallet.availableBalance -= amount;
                await wallet.save({ session });

                if (account) {
                    account.availableBalance += amount;
                    await account.save({ session });
                }

                transaction = await transactionRepository.createTransaction(
                    {
                        transactionNumber,
                        sender: userId,
                        receiver: account ? userId : null,
                        senderWallet: wallet._id,
                        receiverAccount: account ? account._id : null,
                        type: "withdraw",
                        amount,
                        currency: wallet.currency,
                        status: "success",
                        description:
                            description || (account ? "Withdrawn to bank account" : ""),
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
                const senderWallet = await walletRepository.findWalletByUserId(
                    userId,
                    session
                );
                if (!senderWallet) throw new Error("Sender wallet not found.");
                if (senderWallet.status !== "active") throw new Error("Sender wallet is not active.");

                const receiverWallet = await walletRepository.findWalletByUpiId(
                    String(receiverUpiId).toLowerCase().trim(),
                    session
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