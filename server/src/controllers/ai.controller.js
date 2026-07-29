import aiService from "../services/ai.service.js";

class AiController {
    // ==========================
    // POST /api/v1/ai/chat
    // ==========================
    async chat(req, res, next) {
        try {
            const { message, history } = req.body;

            if (!message || typeof message !== "string" || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "A non-empty 'message' field is required.",
                });
            }

            const reply = await aiService.chat(
                req.user,
                message.trim(),
                Array.isArray(history) ? history : []
            );

            return res.status(200).json({
                success: true,
                message: "AI response generated successfully.",
                data: { reply },
            });
        } catch (error) {
            // Surface a clean 502 for provider/config errors instead of a generic 500.
            if (
                error.message?.includes("GROQ_API_KEY") ||
                error.message?.includes("AI provider")
            ) {
                return res.status(502).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
}

export default new AiController();
