import walletRepository from "../repositories/wallet.repository.js";
import transactionRepository from "../repositories/transaction.repository.js";
import * as accountRepository from "../repositories/account.repository.js";
import { decrypt } from "../helpers/encryption.helper.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * =====================================================
 * Build a compact, factual snapshot of the logged-in
 * user's own accounts / wallet / recent transactions.
 * This ALWAYS comes from the database for the current
 * req.user only — the model never sees any other user's
 * data, and the client can never inject this context
 * itself (it is built here, server-side, from the JWT
 * identity only).
 * =====================================================
 */
async function buildUserFinancialContext(userId) {
    const [wallet, accounts, transactions] = await Promise.all([
        walletRepository.findWalletByUserId(userId),
        accountRepository.getAccounts(userId),
        transactionRepository.findTransactionsByUser(userId),
    ]);

    const recentTransactions = (transactions || [])
        .slice(0, 20)
        .map((t) => ({
            date: t.createdAt,
            type: t.type,
            amount: t.amount,
            currency: t.currency,
            status: t.status,
            description: t.description || "",
        }));

    const safeAccounts = (accounts || []).map((a) => {
        let maskedNumber = "N/A";
        try {
            const decrypted = decrypt(a.accountNumber);
            maskedNumber = `••••${String(decrypted).slice(-4)}`;
        } catch {
            maskedNumber = "••••";
        }
        return {
            bankName: a.bankName,
            branchName: a.branchName,
            accountType: a.accountType,
            accountNumberMasked: maskedNumber,
            availableBalance: a.availableBalance,
            status: a.status,
            isPrimary: a.isPrimary,
        };
    });

    const totalIn = recentTransactions
        .filter((t) => t.type === "deposit")
        .reduce((s, t) => s + t.amount, 0);
    const totalOut = recentTransactions
        .filter((t) => t.type === "withdraw" || t.type === "transfer")
        .reduce((s, t) => s + t.amount, 0);

    return {
        wallet: wallet
            ? {
                  walletNumber: wallet.walletNumber,
                  upiId: wallet.upiId,
                  availableBalance: wallet.availableBalance,
                  currency: wallet.currency,
                  status: wallet.status,
              }
            : null,
        accounts: safeAccounts,
        recentTransactions,
        summary: {
            totalRecentDeposits: totalIn,
            totalRecentOutflow: totalOut,
            transactionCount: recentTransactions.length,
        },
    };
}

function buildSystemPrompt(user, context) {
    return `You are the Atlas Bank AI Financial Assistant, built into the customer's dashboard.
You are talking ONLY to ${user.fullName} (their own account) — never mention or reason about any other customer.
Answer using ONLY the JSON data below, which was fetched fresh from the database for this user. Do not invent numbers.
If the data doesn't contain what's needed to answer, say so plainly instead of guessing.
Always format money using the currency given (default INR, symbol ₹). Be concise, friendly, and practical.

USER'S CURRENT FINANCIAL DATA (JSON):
${JSON.stringify(context, null, 2)}`;
}

class AiService {
    async chat(user, message, history = []) {
        const userId = user?._id || user?.id;
        if (!userId) throw new Error("Authenticated user not found.");
        if (!message || !message.trim()) throw new Error("Message is required.");

        if (!process.env.GROQ_API_KEY) {
            throw new Error(
                "AI assistant is not configured yet. Add GROQ_API_KEY to the server .env file."
            );
        }

        const context = await buildUserFinancialContext(userId);

        const messages = [
            { role: "system", content: buildSystemPrompt(user, context) },
            // Keep only the last few turns so the request stays small & cheap.
            ...history.slice(-8).map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: String(m.text || m.content || ""),
            })),
            { role: "user", content: message },
        ];

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                temperature: 0.4,
                max_tokens: 600,
            }),
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            throw new Error(
                `AI provider error (${response.status}): ${errText || response.statusText}`
            );
        }

        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            throw new Error("AI provider returned an empty response.");
        }

        return reply;
    }
}

export default new AiService();
