import api from "../api/axios";

// All calls are scoped to the logged-in user automatically —
// the backend reads the identity from the JWT, never from the request body.
export const walletService = {
  async getMyWallet() {
    const { data } = await api.get("/wallet");
    return data?.data;
  },
  async createWallet() {
    const { data } = await api.post("/wallet", {});
    return data?.data;
  },
  async getWalletQr() {
    const { data } = await api.get("/wallet/qr");
    return data?.data;
  },
};

export default walletService;
