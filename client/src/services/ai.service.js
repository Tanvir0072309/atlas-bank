import api from "../api/axios";

export const aiService = {
    // messages: [{ role: "user" | "assistant", content: string }]
    async chat(messages) {
        const { data } = await api.post("/ai/chat", { messages });
        return data.data?.reply || "";
    },
};

export default aiService;