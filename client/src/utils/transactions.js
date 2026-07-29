// Turns a raw backend Transaction document into a simple, per-user view:
// credit/debit direction, a human label, and a "mode" — used consistently
// across Dashboard, Wallet, Transactions and Analytics so every page reads
// the same real transaction history the same way.

const TYPE_LABELS = {
    deposit: "Deposit",
    withdraw: "Withdrawal",
    withdraw_to_account: "Wallet to Bank",
    transfer: "UPI Transfer",
    bank_transfer: "Bank to Wallet",
};

const TYPE_MODES = {
    deposit: "Wallet",
    withdraw: "Wallet",
    withdraw_to_account: "Bank Transfer",
    transfer: "UPI",
    bank_transfer: "Bank Transfer",
};

const idOf = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    return val._id || val.id || null;
};

export function normalizeTransaction(t, currentUserId) {
    const senderId = idOf(t.sender);
    const receiverId = idOf(t.receiver);
    const isSender = senderId && String(senderId) === String(currentUserId);

    // A withdraw carrying a receiverAccount is a real "Wallet -> Bank Account"
    // transfer rather than a generic withdrawal — label it distinctly.
    const isWithdrawToAccount = t.type === "withdraw" && !!t.receiverAccount;
    const effectiveType = isWithdrawToAccount ? "withdraw_to_account" : t.type;

    // deposit/bank_transfer always land money in the user's own wallet -> credit
    // withdraw always leaves the user's own wallet -> debit
    // transfer: credit if user is receiver, debit if user is sender
    let direction = "credit";
    if (t.type === "withdraw") direction = "debit";
    else if (t.type === "transfer") direction = isSender ? "debit" : "credit";

    let counterparty = null;
    if (t.type === "transfer") {
        counterparty = isSender ? t.receiver : t.sender;
    } else if (t.type === "bank_transfer") {
        counterparty = t.senderAccount?.bankName || "Bank Account";
    } else if (isWithdrawToAccount) {
        counterparty = t.receiverAccount?.bankName || "Bank Account";
    }

    return {
        id: t._id,
        raw: t,
        type: direction, // "credit" | "debit"
        txType: t.type, // deposit | withdraw | transfer | bank_transfer
        effectiveType, // includes the synthetic "withdraw_to_account" split
        desc:
            t.description ||
            (counterparty?.fullName ? `${TYPE_LABELS[effectiveType]} · ${counterparty.fullName}` : TYPE_LABELS[effectiveType]) ||
            "Transaction",
        mode: TYPE_MODES[effectiveType] || "Wallet",
        category: TYPE_LABELS[effectiveType] || "Other",
        date: t.createdAt,
        status: t.status,
        amount: t.amount,
        transactionNumber: t.transactionNumber,
        counterparty,
    };
}

export function normalizeTransactions(transactions = [], currentUserId) {
    return transactions.map((t) => normalizeTransaction(t, currentUserId));
}

// ------- Chart aggregations (all derived from real transaction history) -------

const MONTH_FMT = { month: "short", year: "2-digit" };

function monthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
    return new Date(date).toLocaleDateString("en-IN", MONTH_FMT);
}

// Builds an ordered list of the last `count` months (oldest -> newest),
// even if some months have zero transactions, so the chart axis stays stable.
function lastMonths(count = 6) {
    const months = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ key: monthKey(d), label: monthLabel(d) });
    }
    return months;
}

export function getMonthlySpending(normalized, months = 6) {
    const buckets = lastMonths(months);
    const map = Object.fromEntries(buckets.map((b) => [b.key, 0]));

    normalized.forEach((t) => {
        if (t.type !== "debit") return;
        const key = monthKey(t.date);
        if (key in map) map[key] += t.amount;
    });

    return buckets.map((b) => ({ month: b.label, amount: Math.round(map[b.key]) }));
}

// Start-of-week (Monday) for a given date, at midnight.
function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function weekKey(date) {
    return startOfWeek(date).getTime();
}

function weekLabel(date) {
    const start = startOfWeek(date);
    return start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

// Builds the last `count` week buckets (oldest -> newest) ending this week,
// so the chart axis stays stable even with zero-activity weeks.
function lastWeeks(count = 8) {
    const weeks = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        weeks.push({ key: weekKey(d), label: weekLabel(d) });
    }
    return weeks;
}

export function getWeeklySpending(normalized, weeks = 8) {
    const buckets = lastWeeks(weeks);
    const map = Object.fromEntries(buckets.map((b) => [b.key, 0]));

    normalized.forEach((t) => {
        if (t.type !== "debit") return;
        const key = weekKey(t.date);
        if (key in map) map[key] += t.amount;
    });

    return buckets.map((b) => ({ week: b.label, amount: Math.round(map[b.key]) }));
}

export function getIncomeVsExpense(normalized, months = 6) {
    const buckets = lastMonths(months);
    const incomeMap = Object.fromEntries(buckets.map((b) => [b.key, 0]));
    const expenseMap = Object.fromEntries(buckets.map((b) => [b.key, 0]));

    normalized.forEach((t) => {
        const key = monthKey(t.date);
        if (!(key in incomeMap)) return;
        if (t.type === "credit") incomeMap[key] += t.amount;
        else expenseMap[key] += t.amount;
    });

    return buckets.map((b) => ({
        month: b.label,
        income: Math.round(incomeMap[b.key]),
        expense: Math.round(expenseMap[b.key]),
    }));
}

const CATEGORY_COLORS = {
    Deposit: "#22c55e",
    Withdrawal: "#800A38",
    "Wallet to Bank": "#f97316",
    "UPI Transfer": "#C4185C",
    "Bank to Wallet": "#0EA5E9",
    Other: "#94a3b8",
};

export function getCategorySpending(normalized) {
    const map = {};
    normalized
        .filter((t) => t.type === "debit")
        .forEach((t) => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });

    return Object.entries(map)
        .map(([name, value]) => ({ name, value: Math.round(value), color: CATEGORY_COLORS[name] || "#94a3b8" }))
        .sort((a, b) => b.value - a.value);
}

// Replays transactions chronologically to build a relative running-balance
// trend, then shifts the whole series so the final point equals the real
// current wallet balance. This gives an accurate trend line without needing
// historical balance snapshots in the database.
export function getBalanceTrend(normalized, currentBalance, months = 6) {
    const buckets = lastMonths(months);
    const sorted = [...normalized].sort((a, b) => new Date(a.date) - new Date(b.date));

    const deltaByMonth = Object.fromEntries(buckets.map((b) => [b.key, 0]));
    sorted.forEach((t) => {
        const key = monthKey(t.date);
        if (!(key in deltaByMonth)) return;
        deltaByMonth[key] += t.type === "credit" ? t.amount : -t.amount;
    });

    // running total relative to the start of the window
    let running = 0;
    const relative = buckets.map((b) => {
        running += deltaByMonth[b.key];
        return { month: b.label, relative: running };
    });

    const shift = currentBalance - (relative[relative.length - 1]?.relative || 0);

    return relative.map((r) => ({ month: r.month, balance: Math.max(0, Math.round(r.relative + shift)) }));
}

export function formatCurrency(amount = 0) {
    return `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatDateTime(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}