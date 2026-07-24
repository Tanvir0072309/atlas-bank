import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, Send, Wallet, PiggyBank, Bell, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge, { statusTone } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonCard, SkeletonRow } from "../../components/ui/Skeleton";
import {
  CUSTOMER,
  ACCOUNTS,
  TOTAL_BALANCE,
  TRANSACTIONS,
  NOTIFICATIONS,
  MONTHLY_SPENDING,
  INCOME_VS_EXPENSE,
  formatCurrency,
  formatDateTime,
} from "../../data/mockData";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const savings = ACCOUNTS.find((a) => a.type === "Savings Account");
  const now = new Date();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const quickActions = [
    { label: "Transfer", icon: Send, onClick: () => navigate("/dashboard/transfer") },
    { label: "Deposit", icon: ArrowDownRight, onClick: () => navigate("/dashboard/transfer") },
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
          Welcome back, {CUSTOMER.name.split(" ")[0]} 👋
        </h1>
      </div>

      {/* Balance + Savings + Quick actions */}
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
                <span className="text-xs font-bold uppercase tracking-widest text-rose-200">Total Balance</span>
                <Wallet className="h-5 w-5 text-rose-200" />
              </div>
              <p className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">{formatCurrency(TOTAL_BALANCE)}</p>
              <p className="mt-2 text-xs text-rose-200">Across {ACCOUNTS.length} linked accounts</p>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" /> +4.8% vs last month
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Savings Account</span>
                  <PiggyBank className="h-5 w-5 text-[#800A38]" />
                </div>
                <p className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(savings.balance)}</p>
                <p className="mt-2 text-xs text-slate-500">A/C {savings.masked} · {savings.branch}</p>
                <div className="mt-5">
                  <Badge tone={statusTone(savings.status)}>{savings.status}</Badge>
                </div>
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
            <h3 className="text-sm font-bold text-slate-900">Monthly Spending</h3>
            <Badge tone="primary">Last 6 months</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SPENDING} margin={{ left: -20, top: 10 }}>
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
            <h3 className="text-sm font-bold text-slate-900">Income vs Expense</h3>
            <Badge tone="primary">Last 6 months</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INCOME_VS_EXPENSE} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1e4ea" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #f1d9e2", fontSize: 12 }} />
                <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#C4185C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent transactions + Notifications + Account status */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" noPadding>
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <button onClick={() => navigate("/dashboard/transactions")} className="text-xs font-bold text-[#800A38] hover:underline">
              View all
            </button>
          </div>
          <div className="px-5 sm:px-6 mt-2 divide-y divide-rose-50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : TRANSACTIONS.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-4 py-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-[#800A38]"}`}>
                      {t.type === "credit" ? <ArrowDownRight className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{t.desc}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(t.date)} · {t.mode}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-bold ${t.type === "credit" ? "text-emerald-600" : "text-slate-800"}`}>
                      {t.type === "credit" ? "+" : "−"}{formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
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
              {ACCOUNTS.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{a.nickname}</span>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card noPadding>
            <div className="flex items-center justify-between p-5 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Latest Notifications</h3>
              <Bell className="h-4 w-4 text-slate-400" />
            </div>
            <div className="px-5 pb-5 space-y-3">
              {NOTIFICATIONS.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-[#C4185C]"}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{n.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{n.message}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full justify-center mt-1" onClick={() => navigate("/dashboard/notifications")}>
                View all
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
