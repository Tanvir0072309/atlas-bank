import * as accountService from "../services/account.service.js";
import walletService from "../services/wallet.service.js";
import transactionService from "../services/transaction.service.js";
import aiService from "../services/ai.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/**
 * POST /api/v1/ai/chat
 * Body: { messages: [{ role: "user" | "assistant", content: string }] }
 *
 * Pulls the authenticated user's real accounts, wallet, and recent
 * transactions from the database and hands them to the AI service as
 * grounding context, so replies are personalized instead of generic.
 */
export const chat = asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
        throw new ApiError(400, "messages array is required.");
    }

    const sanitizedMessages = messages
        .filter((m) => m && typeof m.content === "string" && m.content.trim())
        .slice(-12) // keep the request small — last 12 turns is plenty of context
        .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content.trim(),
        }));

    const [accounts, wallet, transactions] = await Promise.all([
        accountService.getAccounts(req.user.id).catch(() => []),
        walletService.getMyWallet(req.user).catch(() => null),
        transactionService.getMyTransactions(req.user).catch(() => []),
    ]);

    const reply = await aiService.getAiReply({
        messages: sanitizedMessages,
        context: { user: req.user, accounts, wallet, transactions },
    });

    return res.status(200).json(
        new ApiResponse(200, { reply }, "AI reply generated successfully.")
    );
});

export default { chat };