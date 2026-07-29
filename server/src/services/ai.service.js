/**
 * AI Financial Assistant — powered by Groq's chat completion API.
 *
 * Uses the built-in `fetch` (Node 18+), so no extra dependency is needed.
 * Set GROQ_API_KEY (and optionally GROQ_MODEL) in server/.env — see the
 * comment in .env.example for details.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const formatCurrency = (amount = 0) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/**
 * Builds a system prompt that grounds the model in the user's *real*
 * account/wallet/transaction data so answers are personalized instead
 * of generic.
 */
export const buildSystemPrompt = ({ user, accounts = [], wallet, transactions = [] }) => {
    const accountsSummary = accounts.length
        ? accounts
            .map(
                (a) =>
                    `- ${a.bankName} (${a.accountType}, ${a.isPrimary ? "primary" : "secondary"
                    }): ${formatCurrency(a.availableBalance)} — status: ${a.status}`
            )
            .join("\n")
        : "No linked bank accounts.";

    const walletSummary = wallet
        ? `Wallet balance: ${formatCurrency(wallet.availableBalance)} | UPI ID: ${wallet.upiId} | Status: ${wallet.status}`
        : "No wallet found for this user.";

    const recentTxSummary = transactions.length
        ? transactions
            .slice(0, 20)
            .map((t) => {
                const isSender = String(t.sender?._id || t.sender) === String(user.id);
                const direction = isSender ? "Debit" : "Credit";
                const date = new Date(t.createdAt).toLocaleDateString("en-IN");
                return `- [${date}] ${direction} ${formatCurrency(t.amount)} · ${t.type} · ${t.description || "no note"
                    } · status: ${t.status}`;
            })
            .join("\n")
        : "No transactions yet.";

    return `You are Atlas AI, the in-app financial assistant for Atlas Bank, a digital bank + wallet product.
You are talking to ${user.fullName} (${user.email}).

Here is this user's REAL, up-to-date account data. Always base your answers on this data — never invent numbers.

Linked bank accounts:
${accountsSummary}

Wallet:
${walletSummary}

Recent transactions (most recent first):
${recentTxSummary}

Guidelines:
- Be concise, warm, and specific — reference actual figures from the data above.
- Help with spending analysis, savings suggestions, budgeting tips, and understanding recent transactions.
- If asked something you cannot know from this data (e.g. predicting the stock market), say so honestly.
- Never claim to be able to move money, change account settings, or perform actions — you can only inform and advise.
- Keep replies short (2-5 sentences) unless the user asks for a detailed breakdown.
- Format currency in Indian Rupees (₹) using Indian digit grouping.`;
};

/**
 * @param {Object} params
 * @param {Array<{role: string, content: string}>} params.messages - prior conversation (user/assistant turns only)
 * @param {Object} params.context - { user, accounts, wallet, transactions }
 */
export const getAiReply = async ({ messages = [], context }) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        const err = new Error(
            "AI assistant is not configured yet. Add GROQ_API_KEY to server/.env and restart the server."
        );
        err.statusCode = 503;
        throw err;
    }

    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL || DEFAULT_MODEL,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            temperature: 0.4,
            max_tokens: 600,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        const err = new Error(
            `AI provider error (${response.status}). ${errorBody.slice(0, 300)}`
        );
        err.statusCode = 502;
        throw err;
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
        const err = new Error("AI provider returned an empty response.");
        err.statusCode = 502;
        throw err;
    }

    return reply.trim();
};

export default { getAiReply, buildSystemPrompt };