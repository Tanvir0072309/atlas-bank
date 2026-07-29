import Transaction from "../models/transaction.model.js";

class TransactionRepository {
    // ==========================
    // Create Transaction
    // ==========================
    async createTransaction(transactionData, session = null) {
        if (session) {
            const [transaction] = await Transaction.create(
                [transactionData],
                { session }
            );

            return transaction;
        }

        return await Transaction.create(transactionData);
    }

    // ==========================
    // Find By Id
    // ==========================
    async findTransactionById(transactionId) {
        return await Transaction.findById(transactionId)
            .populate("sender", "fullName email phone")
            .populate("receiver", "fullName email phone")
            .populate("senderWallet")
            .populate("receiverWallet")
            .populate("senderAccount", "bankName accountType branchName")
            .populate("receiverAccount", "bankName accountType branchName");
    }

    // ==========================
    // Find By Number
    // ==========================
    async findTransactionByNumber(transactionNumber) {
        return await Transaction.findOne({
            transactionNumber,
        });
    }

    // ==========================
    // User Transactions
    // ==========================
    async findTransactionsByUser(userId) {
        return await Transaction.find({
            deletedAt: null,
            $or: [
                { sender: userId },
                { receiver: userId },
            ],
        })
            .sort({ createdAt: -1 })
            .populate("sender", "fullName email phone")
            .populate("receiver", "fullName email phone")
            .populate("senderWallet")
            .populate("receiverWallet");
    }

    // ==========================
    // Update
    // ==========================
    async updateTransaction(transactionId, updateData, session = null) {
        return await Transaction.findByIdAndUpdate(
            transactionId,
            updateData,
            {
                returnDocument: "after",
                runValidators: true,
                session,
            }
        );
    }

    // ==========================
    // Soft Delete
    // ==========================
    async softDeleteTransaction(transactionId) {
        return await Transaction.findByIdAndUpdate(
            transactionId,
            {
                deletedAt: new Date(),
            },
            {
                returnDocument: "after",
            }
        );
    }
}

export default new TransactionRepository();