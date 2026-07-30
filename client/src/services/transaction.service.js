import api from "../api/axios";

export const transactionService = {
  // History — always fetched fresh from the database for the logged-in user.
  async getMyTransactions() {
    const { data } = await api.get("/transactions");
    return data?.data || [];
  },

  async getTransactionById(transactionId) {
    const { data } = await api.get(`/transactions/${transactionId}`);
    return data?.data;
  },

  // UPI-to-UPI transfer, wallet → wallet.
  async transferUpi({ receiverUpiId, amount, description }) {
    const { data } = await api.post("/transactions/transfer", {
      receiverUpiId,
      amount: Number(amount),
      description,
    });
    return data?.data;
  },

  // Bank account → wallet ("Add money" / deposit).
  async depositFromBank({ accountId, amount, description }) {
    const { data } = await api.post("/transactions/deposit", {
      accountId,
      amount: Number(amount),
      description,
    });
    return data?.data;
  },

  // Wallet → bank account.
  async withdrawToBank({ accountId, amount, description }) {
    const { data } = await api.post("/transactions/withdraw", {
      accountId,
      amount: Number(amount),
      description,
    });
    return data?.data;
  },
};

export default transactionService;
