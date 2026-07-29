import api from "../api/axios";

export const aiService = {
  // history: [{ role: "user" | "assistant", text }]
  async chat(message, history = []) {
    const { data } = await api.post("/ai/chat", { message, history });
    return data?.data?.reply;
  },
};

export default aiService;
