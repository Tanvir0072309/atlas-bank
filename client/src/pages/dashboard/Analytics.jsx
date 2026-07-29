import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton, SkeletonCard } from "../../components/ui/Skeleton";
import { useBankingData } from "../../hooks/useBankingData";
import {
  getMonthlySpending,
  getWeeklySpending,
  getIncomeVsExpense,
  getCategorySpending,
  getBalanceTrend,
  formatCurrency,
} from "../../utils/transactions";

export default function Analytics() {
  const { wallet, normalizedTransactions, loading } = useBankingData();

  const monthlySpending = getMonthlySpending(normalizedTransactions);
  const weeklySpending = getWeeklySpending(normalizedTransactions);
  const incomeVsExpense = getIncomeVsExpense(normalizedTransactions);
  const categorySpending = getCategorySpending(normalizedTransactions);
  const balanceTrend = getBalanceTrend(normalizedTransactions, wallet?.availableBalance || 0);

  const hasData = normalizedTransactions.length > 0;

  // All-time, exact totals — summed straight from every transaction the user
  // has (not just the last-6-months chart window), so "how much I've spent"
  // and "how much has come in" are precise, not an approximation.
  const allTimeSpend = normalizedTransactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + t.amount, 0);
  const allTimeIncome = normalizedTransactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);

  const monthsWithData = monthlySpending.length || 1;
  const avgSpend = Math.round(allTimeSpend / monthsWithData);
  const savingsRate = allTimeIncome > 0 ? Math.round(((allTimeIncome - allTimeSpend) / allTimeIncome) * 100) : 0;
  const debitCount = normalizedTransactions.filter((t) => t.type === "debit").length;
  const creditCount = normalizedTransactions.filter((t) => t.type === "credit").length;
  const topCategory = categorySpending[0]?.name || "—";

  const insights = [
    { icon: ArrowUpCircle, label: "Total Spent (all-time)", value: formatCurrency(allTimeSpend), tone: "text-[#800A38]", bg: "bg-rose-50" },
    { icon: ArrowDownCircle, label: "Total Received (all-time)", value: formatCurrency(allTimeIncome), tone: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: TrendingDown, label: "Avg. Monthly Spend", value: formatCurrency(avgSpend), tone: "text-[#800A38]", bg: "bg-rose-50" },
    { icon: TrendingUp, label: "Savings Rate", value: `${savingsRate}%`, tone: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Wallet, label: "Total Transactions", value: debitCount + creditCount, tone: "text-sky-600", bg: "bg-sky-50" },
    { icon: PiggyBank, label: "Top Category", value: topCategory, tone: "text-[#C4185C]", bg: "bg-rose-50" },
  ];

  return (
    <div>
      <PageHeader title="Analytics" crumb="Analytics" description="Understand your spending patterns and financial health, computed live from your real transaction history." />

      {/* Insight cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-5">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          insights.map(({ icon: Icon, label, value, tone, bg }) => (
            <Card key={label}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xl font-extrabold text-slate-900 truncate">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </Card>
          ))
        )}
      </div>

      {!loading && !hasData ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Not enough data yet"
            description="Once you send, receive, or add money, your spending charts will appear here — built entirely from your real transactions."
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-sm font-bold text-slate-900">Monthly Spending</h3>
            <div className="h-60">
              {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySpending} margin={{ left: -20, top: 10 }}>
                    <defs>
                      <linearGradient id="spendGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#800A38" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#800A38" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                    <Area type="monotone" dataKey="amount" stroke="#800A38" strokeWidth={2.5} fill="url(#spendGradient2)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold text-slate-900">Weekly Spending</h3>
            <div className="h-60">
              {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySpending} margin={{ left: -20, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                    <Bar dataKey="amount" fill="#C4185C" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold text-slate-900">Income vs Expense</h3>
            <div className="h-60">
              {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpense} margin={{ left: -20, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#C4185C" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold text-slate-900">Category-wise Expenses</h3>
            <div className="h-64 flex items-center">
              {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : categorySpending.length === 0 ? (
                <EmptyState icon={PiggyBank} title="No spending yet" description="Debit transactions will be broken down by category here." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorySpending} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {categorySpending.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Savings Graph (Balance Trend)</h3>
            <div className="h-64">
              {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceTrend} margin={{ left: -20, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                    <Line type="monotone" dataKey="balance" stroke="#800A38" strokeWidth={2.5} dot={{ r: 4, fill: "#800A38" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}