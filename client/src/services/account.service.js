import api from "../api/axios";

export const accountService = {
  async getAccounts() {
    const { data } = await api.get("/accounts");
    return data?.data || [];
  },
  async getAccountById(accountId) {
    const { data } = await api.get(`/accounts/${accountId}`);
    return data?.data;
  },
  async createAccount(payload) {
    const { data } = await api.post("/accounts", payload);
    return data?.data;
  },
  async setPrimary(accountId) {
    const { data } = await api.patch(`/accounts/${accountId}/primary`, {});
    return data?.data;
  },
};

export default accountService;
