import transactionRepository from "../repositories/transaction.repository.js";
import walletRepository from "../repositories/wallet.repository.js";
import { generateTransactionNumber } from "../helpers/transactionNumber.helper.js";

class TransactionService {
    // ==========================
    // Deposit
    // ==========================
    async deposit(user, amount, description = "") {
        const userId = user?._id || user?.id;

        if (!userId) {
            throw new Error("Authenticated user not found.");
        }

        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }

        const wallet = await walletRepository.findWalletByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        if (wallet.status !== "active") {
            throw new Error("Wallet is not active.");
        }

        const transactionNumber = await generateTransactionNumber();

        wallet.availableBalance += amount;
        await wallet.save();

        return await transactionRepository.createTransaction({
            transactionNumber,
            receiver: userId,
            receiverWallet: wallet._id,
            type: "deposit",
            amount,
            currency: wallet.currency,
            status: "success",
            description,
        });
    }

    // ==========================
    // Withdraw
    // ==========================
    async withdraw(user, amount, description = "") {
        const userId = user?._id || user?.id;

        if (!userId) {
            throw new Error("Authenticated user not found.");
        }

        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }

        const wallet = await walletRepository.findWalletByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        if (wallet.status !== "active") {
            throw new Error("Wallet is not active.");
        }

        if (wallet.availableBalance < amount) {
            throw new Error("Insufficient wallet balance.");
        }

        const transactionNumber = await generateTransactionNumber();

        wallet.availableBalance -= amount;
        await wallet.save();

        return await transactionRepository.createTransaction({
            transactionNumber,
            sender: userId,
            senderWallet: wallet._id,
            type: "withdraw",
            amount,
            currency: wallet.currency,
            status: "success",
            description,
        });
    }

    // ==========================
    // Transfer
    // ==========================
    async transfer(user, receiverUpiId, amount, description = "") {
        const userId = user?._id || user?.id;

        if (!userId) {
            throw new Error("Authenticated user not found.");
        }

        if (amount <= 0) {
            throw new Error("Amount must be greater than zero.");
        }

        const senderWallet =
         await walletRepository.findWalletByUserId(userId);   

        if (!senderWallet) {
            throw new Error("Sender wallet not found.");
        }

        if (senderWallet.status !== "active") {
            throw new Error("Sender wallet is not active.");
        }

        const receiverWallet =
            await walletRepository.findWalletByUpiId(receiverUpiId);

        if (!receiverWallet) {
            throw new Error("Receiver wallet not found.");
        }

        if (receiverWallet.status !== "active") {
            throw new Error("Receiver wallet is not active.");
        }

        if (senderWallet._id.toString() === receiverWallet._id.toString()) {
            throw new Error("You cannot transfer money to your own UPI ID.");
        }

        if (senderWallet.availableBalance < amount) {
            throw new Error("Insufficient wallet balance.");
        }

        senderWallet.availableBalance -= amount;
        receiverWallet.availableBalance += amount;

        await senderWallet.save();
        await receiverWallet.save();

        const transactionNumber =
            await generateTransactionNumber();

        return await transactionRepository.createTransaction({
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
        });
    }

    // ==========================
    // Get My Transactions
    // ==========================
    async getMyTransactions(user) {
        const userId = user?._id || user?.id;

        if (!userId) {
            throw new Error("Authenticated user not found.");
        }

        return await transactionRepository.findTransactionsByUser(userId);
    }

    // ==========================
    // Get Transaction By Id
    // ==========================
    async getTransactionById(user, transactionId) {
        const userId = user?._id || user?.id;

        const transaction =
            await transactionRepository.findTransactionById(transactionId);

        if (!transaction) {
            throw new Error("Transaction not found.");
        }

        const isSender =
            transaction.sender &&
            transaction.sender._id.toString() === userId.toString();

        const isReceiver =
            transaction.receiver &&
            transaction.receiver._id.toString() === userId.toString();

        if (!isSender && !isReceiver) {
            throw new Error("Unauthorized access.");
        }

        return transaction;
    }
}

export default new TransactionService();