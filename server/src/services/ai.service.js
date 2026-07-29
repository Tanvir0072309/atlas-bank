import walletRepository from "../repositories/wallet.repository.js";
import transactionRepository from "../repositories/transaction.repository.js";
import * as accountRepository from "../repositories/account.repository.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// llama-3.3-70b-versatile was deprecated by Groq — openai/gpt-oss-120b is a
// current production model. Override with GROQ_MODEL in .env if needed.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

/**
 * =====================================================
 * Build a compact, factual snapshot of the logged-in
 * user's MONEY DATA ONLY — wallet, linked-account balances,
 * and transactions. This is fetched fresh from the database
 * for the current req.user only, so the model never sees
 * any other user's data.
 *
 * Deliberately EXCLUDED, by design:
 *   - profile info (name, email, phone, customer ID, etc.)
 *   - bank account numbers / IFSC / branch (any account identifiers)
 * The assistant only ever knows balances and transaction history.
 * =====================================================
 */
async function buildUserFinancialContext(userId) {
    const [wallet, accounts, transactions] = await Promise.all([
        walletRepository.findWalletByUserId(userId),
        accountRepository.getAccounts(userId),
        transactionRepository.findTransactionsByUser(userId),
    ]);

    const recentTransactions = (transactions || [])
        .slice(0, 30)
        .map((t) => ({
            date: t.createdAt,
            type: t.type,
            amount: t.amount,
            currency: t.currency,
            status: t.status,
            description: t.description || "",
        }));

    // No account numbers, IFSC, or branch here — balance/type only.
    const safeAccounts = (accounts || []).map((a) => ({
        bankName: a.bankName,
        accountType: a.accountType,
        availableBalance: a.availableBalance,
        status: a.status,
        isPrimary: a.isPrimary,
    }));

    const totalIn = recentTransactions
        .filter((t) => t.type === "deposit")
        .reduce((s, t) => s + t.amount, 0);
    const totalOut = recentTransactions
        .filter((t) => t.type === "withdraw" || t.type === "transfer")
        .reduce((s, t) => s + t.amount, 0);

    return {
        wallet: wallet
            ? {
                  upiId: wallet.upiId,
                  availableBalance: wallet.availableBalance,
                  currency: wallet.currency,
                  status: wallet.status,
              }
            : null,
        linkedBankAccounts: safeAccounts,
        recentTransactions,
        summary: {
            totalRecentDeposits: totalIn,
            totalRecentOutflow: totalOut,
            transactionCount: recentTransactions.length,
        },
    };
}

function buildSystemPrompt(firstName, context) {
    return `You are the Atlas Bank AI Financial Assistant, built into the customer's dashboard.
You are talking to ${firstName}, the currently authenticated customer, about their own money only.

STRICT SCOPE — you have deliberately NOT been given this customer's email, phone, customer ID, or any bank account number/IFSC/branch. You only know their first name, wallet balance, linked-account balances, and transaction history.
- You may address the customer by their first name (${firstName}).
- Never invent an account number, email, phone, or any other identity detail — you don't have them.
- Only discuss their own money data below. If asked something outside this scope (identity details, other customers, anything not in the JSON), say plainly that you don't have access to that information.

Answer using ONLY the JSON data below, which was fetched fresh from the database for this user. Do not invent numbers.
Always format money using the currency given (default INR, symbol ₹). Be concise, friendly, and practical.

FORMATTING — reply in clean, well-structured markdown so it renders nicely in a chat bubble:
- Use short paragraphs; **bold** key figures like amounts and balances.
- Use a bullet or numbered list whenever you give more than one item, step, or tip.
- Use a small markdown table only when comparing multiple transactions/numbers side by side.
- Never use a top-level heading (#); at most a bold line as a mini heading. Keep it skimmable, not a wall of text.

CUSTOMER'S FINANCIAL DATA (JSON):
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
        const firstName = (user.fullName || "there").trim().split(" ")[0];

        const messages = [
            { role: "system", content: buildSystemPrompt(firstName, context) },
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
