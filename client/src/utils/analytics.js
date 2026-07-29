// Turns the real transaction list (fetched from the database) into the
// datasets every chart on the dashboard needs. No mock numbers — if there
// are no transactions yet, every chart simply renders empty/zeroed.

const MONTH_LABEL = (d) => d.toLocaleDateString("en-IN", { month: "short" });

function lastNMonthKeys(n = 6) {
  const now = new Date();
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABEL(d), date: d });
  }
  return keys;
}

// Monthly spend = money leaving the wallet (withdraw + transfer), last 6 months.
export function buildMonthlySpending(transactions = []) {
  const months = lastNMonthKeys(6);
  return months.map(({ key, label, date }) => {
    const amount = transactions
      .filter((t) => {
        const d = new Date(t.createdAt);
        const tKey = `${d.getFullYear()}-${d.getMonth()}`;
        return tKey === key && (t.type === "withdraw" || t.type === "transfer");
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    return { month: label, amount };
  });
}

// Income (deposits) vs expense (withdraw + transfer), last 6 months.
export function buildIncomeVsExpense(transactions = []) {
  const months = lastNMonthKeys(6);
  return months.map(({ key, label }) => {
    const monthTx = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}` === key;
    });
    const income = monthTx.filter((t) => t.type === "deposit").reduce((s, t) => s + (t.amount || 0), 0);
    const expense = monthTx
      .filter((t) => t.type === "withdraw" || t.type === "transfer")
      .reduce((s, t) => s + (t.amount || 0), 0);
    return { month: label, income, expense };
  });
}

const TYPE_COLORS = {
  deposit: "#22c55e",
  transfer: "#800A38",
  withdraw: "#C4185C",
};
const TYPE_LABELS = {
  deposit: "Deposits (Bank → Wallet)",
  transfer: "UPI Transfers",
  withdraw: "Withdrawals (Wallet → Bank)",
};

// Breakdown by transaction type — the real schema doesn't have spending
// "categories", so this is the honest equivalent: how money moved.
export function buildTypeBreakdown(transactions = []) {
  const totals = { deposit: 0, transfer: 0, withdraw: 0 };
  transactions.forEach((t) => {
    if (totals[t.type] !== undefined) totals[t.type] += t.amount || 0;
  });
  return Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({ name: TYPE_LABELS[type], value, color: TYPE_COLORS[type] }));
}

// Wallet balance trend — replays transactions chronologically to reconstruct
// the balance at the end of each of the last 6 months.
export function buildBalanceTrend(transactions = [], currentBalance = 0) {
  const months = lastNMonthKeys(6);
  const sorted = [...transactions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Walk backwards from the current balance to find the balance at the end of each month.
  let runningBalance = currentBalance;
  const balanceAtEndOfMonth = {};
  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (balanceAtEndOfMonth[key] === undefined) balanceAtEndOfMonth[key] = runningBalance;
    const delta = t.type === "deposit" ? t.amount : -t.amount;
    runningBalance -= delta;
  }

  let lastKnown = runningBalance;
  return months.map(({ key, label }) => {
    if (balanceAtEndOfMonth[key] !== undefined) {
      lastKnown = balanceAtEndOfMonth[key];
    }
    return { month: label, balance: Math.max(lastKnown, 0) };
  });
}
