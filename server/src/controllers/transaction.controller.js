import transactionService from "../services/transaction.service.js";
import {
    depositValidator,
    withdrawValidator,
    transferValidator,
} from "../validators/transaction.validator.js";

class TransactionController {
    // ==========================
    // Deposit
    // ==========================
    async deposit(req, res, next) {
        try {
            const { error, value } = depositValidator.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message,
                });
            }

            const { amount, description } = value;

            const transaction = await transactionService.deposit(
                req.user,
                amount,
                description
            );

            return res.status(201).json({
                success: true,
                message: "Amount deposited successfully.",
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // Withdraw
    // ==========================
    async withdraw(req, res, next) {
        try {
            const { error, value } = withdrawValidator.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message,
                });
            }

            const { amount, description } = value;

            const transaction = await transactionService.withdraw(
                req.user,
                amount,
                description
            );

            return res.status(200).json({
                success: true,
                message: "Amount withdrawn successfully.",
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // Transfer (UPI-to-UPI)
    // ==========================
    async transfer(req, res, next) {
        try {
            const { error, value } = transferValidator.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message,
                });
            }

            const { receiverUpiId, amount, description } = value;

            const transaction = await transactionService.transfer(
                req.user,
                receiverUpiId,
                amount,
                description
            );

            return res.status(201).json({
                success: true,
                message: "Amount transferred successfully.",
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // Get My Transactions
    // ==========================
    async getMyTransactions(req, res, next) {
        try {
            const transactions =
                await transactionService.getMyTransactions(req.user);

            return res.status(200).json({
                success: true,
                message: "Transactions fetched successfully.",
                count: transactions.length,
                data: transactions,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==========================
    // Get Transaction By Id
    // ==========================
    async getTransactionById(req, res, next) {
        try {
            const { transactionId } = req.params;

            const transaction =
                await transactionService.getTransactionById(
                    req.user,
                    transactionId
                );

            return res.status(200).json({
                success: true,
                message: "Transaction fetched successfully.",
                data: transaction,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TransactionController();