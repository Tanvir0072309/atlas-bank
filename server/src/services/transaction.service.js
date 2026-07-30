import transactionRepository from "../repositories/transaction.repository.js";
import walletRepository from "../repositories/wallet.repository.js";
import * as accountRepository from "../repositories/account.repository.js";
import { generateTransactionNumber } from "../helpers/transactionNumber.helper.js";
import { runInTransaction } from "../utils/transactionRunner.js";

class TransactionService {
    // ==========================
    // Deposit (Bank Account -> Wallet)
    // ==========================
    async deposit(user, accountId, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (!accountId) throw new Error("Bank account is required.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        return await runInTransaction(async (session) => {
            const wallet = await walletRepository.findWalletByUserId(
                userId,
                session
            );
            if (!wallet) throw new Error("Wallet not found.");
            if (wallet.status !== "active") throw new Error("Wallet is not active.");

            const account = await accountRepository.getAccountById(
                userId,
                accountId,
                session
            );
            if (!account) throw new Error("Bank account not found.");
            // Accounts created before the auto-activate fix can be stuck at
            // "pending" forever since there's no verification workflow that
            // ever flips them to "active" — self-heal here instead of
            // hard-blocking every transaction for that account.
            if (account.status === "pending") account.status = "active";
            if (["blocked", "closed"].includes(account.status)) {
                throw new Error("Bank account is not active.");
            }
            if (account.availableBalance < amount) {
                throw new Error("Insufficient balance in the selected bank account.");
            }

            const transactionNumber = await generateTransactionNumber();

            account.availableBalance -= amount;
            wallet.availableBalance += amount;

            await account.save({ session });
            await wallet.save({ session });

            return await transactionRepository.createTransaction(
                {
                    transactionNumber,
                    sender: userId,
                    receiver: userId,
                    senderAccount: account._id,
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
    }

    // ==========================
    // Withdraw (Wallet -> Bank Account)
    // ==========================
    async withdraw(user, accountId, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (!accountId) throw new Error("Bank account is required.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        return await runInTransaction(async (session) => {
            const wallet = await walletRepository.findWalletByUserId(
                userId,
                session
            );
            if (!wallet) throw new Error("Wallet not found.");
            if (wallet.status !== "active") throw new Error("Wallet is not active.");
            if (wallet.availableBalance < amount) throw new Error("Insufficient wallet balance.");

            const account = await accountRepository.getAccountById(
                userId,
                accountId,
                session
            );
            if (!account) throw new Error("Bank account not found.");
            if (account.status === "pending") account.status = "active";
            if (["blocked", "closed"].includes(account.status)) {
                throw new Error("Bank account is not active.");
            }

            const transactionNumber = await generateTransactionNumber();

            wallet.availableBalance -= amount;
            account.availableBalance += amount;

            await wallet.save({ session });
            await account.save({ session });

            return await transactionRepository.createTransaction(
                {
                    transactionNumber,
                    sender: userId,
                    receiver: userId,
                    senderWallet: wallet._id,
                    receiverAccount: account._id,
                    type: "withdraw",
                    amount,
                    currency: wallet.currency,
                    status: "success",
                    description,
                },
                session
            );
        });
    }

    // ==========================
    // Transfer (UPI-to-UPI)
    // ==========================
    async transfer(user, receiverUpiId, amount, description = "") {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (amount <= 0) throw new Error("Amount must be greater than zero.");

        return await runInTransaction(async (session) => {
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

            return await transactionRepository.createTransaction(
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
