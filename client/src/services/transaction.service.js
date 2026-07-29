import api from "../api/axios";

export const transactionService = {
    async getMyTransactions() {
        const { data } = await api.get("/transactions");
        return data.data || [];
    },

    async getTransactionById(transactionId) {
        const { data } = await api.get(`/transactions/${transactionId}`);
        return data.data;
    },

    // UPI-to-UPI transfer
    async transferUpi({ receiverUpiId, amount, description }) {
        const { data } = await api.post("/transactions/transfer", {
            receiverUpiId,
            amount,
            description,
        });
        return data.data;
    },

    // Bank Account -> Wallet transfer
    async bankToWallet({ accountId, amount, description }) {
        const { data } = await api.post("/transactions/bank-transfer", {
            accountId,
            amount,
            description,
        });
        return data.data;
    },

    async deposit({ amount, description }) {
        const { data } = await api.post("/transactions/deposit", { amount, description });
        return data.data;
    },

    async withdraw({ amount, description, accountId }) {
        const { data } = await api.post("/transactions/withdraw", { amount, description, accountId });
        return data.data;
    },
};

export default transactionService;