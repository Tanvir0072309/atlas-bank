import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, Send, Wallet, PiggyBank, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge, { statusTone } from "../../components/ui/Badge";
import { SkeletonCard, SkeletonRow } from "../../components/ui/Skeleton";
import { formatCurrency, formatDateTime } from "../../data/mockData";
import { useAuth } from "../../hooks/useAuth";
import walletService from "../../services/wallet.service";
import accountService from "../../services/account.service";
import transactionService from "../../services/transaction.service";
import { buildMonthlySpending, buildIncomeVsExpense } from "../../utils/analytics";
import { useToast } from "../../components/ui/Toast";

const TYPE_META = {
  deposit: { label: "Bank → Wallet Deposit", direction: "credit" },
  transfer: { label: "UPI Transfer", direction: "debit" },
  withdraw: { label: "Wallet → Bank Withdrawal", direction: "debit" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();
  const now = new Date();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [w, accs, txns] = await Promise.all([
          walletService.getMyWallet().catch(() => null),
          accountService.getAccounts().catch(() => []),
          transactionService.getMyTransactions().catch(() => []),
        ]);
        setWallet(w);
        setAccounts(accs);
        setTransactions(txns);
      } catch (err) {
        toast?.showToast(err?.response?.data?.message || "Could not load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primaryBank = accounts.find((a) => a.isPrimary) || accounts[0] || null;
  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [transactions]
  );
  const monthlySpending = useMemo(() => buildMonthlySpending(transactions), [transactions]);
  const incomeVsExpense = useMemo(() => buildIncomeVsExpense(transactions), [transactions]);

  const quickActions = [
    { label: "Transfer", icon: Send, onClick: () => navigate("/dashboard/transactions") },
    { label: "Deposit", icon: ArrowDownRight, onClick: () => navigate("/dashboard/transactions") },
    { label: "Withdraw", icon: ArrowUpRight, onClick: () => navigate("/dashboard/transfer") },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-400">
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {user?.fullName?.split(" ")[0] || "there"} 👋
        </h1>
      </div>

      {/* Balance + Bank + Quick actions */}
      <div className="grid gap-5 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-[#800A38] via-[#6b0830] to-[#5C0526] p-6 text-white shadow-xl shadow-[#800A38]/25"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-200">Wallet Balance</span>
                <Wallet className="h-5 w-5 text-rose-200" />
              </div>
              <p className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">{formatCurrency(wallet?.availableBalance || 0)}</p>
              <p className="mt-2 text-xs text-rose-200">Available to spend or transfer</p>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" /> Ready for UPI transfers
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Linked Bank Account</span>
                  <PiggyBank className="h-5 w-5 text-[#800A38]" />
                </div>
                {primaryBank ? (
                  <>
                    <p className="mt-4 text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">{primaryBank.bankName}</p>
                    <p className="mt-2 text-xs text-slate-500">{primaryBank.branchName} · {primaryBank.accountType}</p>
                    <div className="mt-5">
                      <Badge tone={statusTone(primaryBank.status)}>{primaryBank.status}</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-sm font-semibold text-slate-500">No bank account linked yet.</p>
                    <button onClick={() => navigate("/dashboard/cards")} className="mt-4 text-xs font-bold text-[#800A38] hover:underline">
                      Add a bank account
                    </button>
                  </>
                )}
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="h-full">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Actions</span>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  {quickActions.map(({ label, icon: Icon, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50/50 py-4 text-xs font-bold text-[#800A38] hover:bg-[#800A38] hover:text-white hover:border-[#800A38] transition-all duration-200"
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Monthly Outflow</h3>
            <Badge tone="primary">Last 6 months</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpending} margin={{ left: -20, top: 10 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#800A38" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#800A38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" stroke="#800A38" strokeWidth={2.5} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Deposits vs Outflow</h3>
            <Badge tone="primary">Last 6 months</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                <Bar dataKey="income" name="Deposits" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Outflow" fill="#C4185C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent transactions + Account status */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" noPadding>
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <button onClick={() => navigate("/dashboard/transactions")} className="text-xs font-bold text-[#800A38] hover:underline">
              View all
            </button>
          </div>
          <div className="px-5 sm:px-6 mt-2 divide-y divide-rose-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentTransactions.length === 0 ? (
              <p className="py-6 text-sm text-slate-400">No transactions yet. Send money or add funds to get started.</p>
            ) : (
              recentTransactions.map((t) => {
                const meta = TYPE_META[t.type] || { label: t.type, direction: "debit" };
                const isCredit = meta.direction === "credit";
                return (
                  <div key={t._id} className="flex items-center gap-4 py-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-[#800A38]"}`}>
                      {isCredit ? <ArrowDownRight className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{t.description || meta.label}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(t.createdAt)} · {meta.label}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-bold ${isCredit ? "text-emerald-600" : "text-slate-800"}`}>
                      {isCredit ? "+" : "−"}{formatCurrency(t.amount)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          <div className="h-4" />
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Account Status</h3>
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Wallet</span>
                <Badge tone={statusTone(wallet?.status || "active")}>{wallet?.status || "active"}</Badge>
              </div>
              {primaryBank && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{primaryBank.bankName}</span>
                  <Badge tone={statusTone(primaryBank.status)}>{primaryBank.status}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Email Verification</span>
                <Badge tone={statusTone(user?.isEmailVerified ? "verified" : "unverified")}>
                  {user?.isEmailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
