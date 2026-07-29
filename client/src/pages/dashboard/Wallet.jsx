import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet as WalletIcon,
  Send,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Eye,
  EyeOff,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge, { statusTone } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard, SkeletonRow } from "../../components/ui/Skeleton";
import { useBankingData } from "../../hooks/useBankingData";
import { formatCurrency, formatDateTime } from "../../utils/transactions";

const TYPE_ICON = {
  credit: ArrowDownRight,
  debit: ArrowUpRight,
};

export default function Wallet() {
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);
  const { wallet, accounts, normalizedTransactions, loading } = useBankingData();

  const last10 = normalizedTransactions.slice(0, 10);

  const quickActions = [
    { label: "Send Money", icon: Send, onClick: () => navigate("/dashboard/transactions") },
    { label: "Add Money", icon: PlusCircle, onClick: () => navigate("/dashboard/transactions") },
    { label: "Bank Cards", icon: Landmark, onClick: () => navigate("/dashboard/cards") },
  ];

  return (
    <div>
      <PageHeader title="Wallet" crumb="Wallet" description="Your Atlas wallet balance, linked bank accounts, and recent activity." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Wallet balance card */}
        {loading ? (
          <div className="lg:col-span-2"><SkeletonCard /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800A38] via-[#6b0830] to-[#5C0526] p-6 sm:p-8 text-white shadow-xl shadow-[#800A38]/25"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-200">
                <WalletIcon className="h-4 w-4" /> Available Balance
              </span>
              <button
                onClick={() => setHideBalance((v) => !v)}
                className="rounded-lg p-1.5 text-rose-200 hover:bg-white/10 transition-colors"
                aria-label="Toggle balance visibility"
              >
                {hideBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            <p className="relative mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
              {hideBalance ? "•••••••" : wallet ? formatCurrency(wallet.availableBalance) : "—"}
            </p>
            <p className="relative mt-2 text-xs text-rose-200">
              {wallet ? `UPI ID · ${wallet.upiId}` : "No wallet found yet"}
            </p>

            <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {quickActions.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3.5 text-[11px] sm:text-xs font-bold text-white hover:bg-white/20 transition-all duration-200"
                >
                  <Icon className="h-4.5 w-4.5" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Wallet status */}
        {loading ? (
          <SkeletonCard />
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Wallet Status</span>
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <p className="mt-4 text-lg font-extrabold text-slate-900 capitalize">{wallet?.status || "Not set up"}</p>
              <p className="mt-1 text-xs text-slate-500">Wallet Number: {wallet?.walletNumber || "—"}</p>
              <div className="mt-4">
                <Badge tone={statusTone(wallet?.status)} className="capitalize">{wallet?.status || "unknown"}</Badge>
              </div>
              <Button variant="secondary" size="sm" className="mt-5 w-full" onClick={() => navigate("/dashboard/cards")}>
                Manage Bank Accounts
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Linked bank accounts — shown as small, compact chips (not the big Cards page cards) */}
      <Card noPadding className="mt-5">
        <div className="flex items-center justify-between p-5 sm:p-6 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Linked Bank Accounts</h3>
          <button onClick={() => navigate("/dashboard/cards")} className="text-xs font-bold text-[#800A38] hover:underline">
            Manage
          </button>
        </div>

        {loading ? (
          <div className="px-5 sm:px-6 pb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-rose-100/70" />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Landmark}
              title="No bank accounts linked"
              description="Add a bank account to move money into your wallet."
              action={<Button size="sm" icon={PlusCircle} onClick={() => navigate("/dashboard/cards")}>Add Bank Account</Button>}
            />
          </div>
        ) : (
          <div className="px-5 sm:px-6 pb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((a) => (
              <div key={a._id} className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 px-3.5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#800A38] border border-rose-100">
                  <Landmark className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 flex items-center gap-1">
                    {a.bankName}
                    {a.isPrimary && <Star className="h-3 w-3 shrink-0 fill-current text-amber-400" />}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">{a.accountNumber || "•••• ••••"} · {a.branchName}</p>
                </div>
                <Badge tone={statusTone(a.status)} className="shrink-0 capitalize">{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Last 10 transactions */}
      <Card noPadding className="mt-5">
        <div className="flex items-center justify-between p-5 sm:p-6 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Last 10 Transactions</h3>
          <button onClick={() => navigate("/dashboard/transactions")} className="text-xs font-bold text-[#800A38] hover:underline">
            View all
          </button>
        </div>

        {loading ? (
          <div className="px-5 sm:px-6 pb-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : last10.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={WalletIcon} title="No wallet activity yet" description="Add money or send your first transfer to see it here." />
          </div>
        ) : (
          <div className="px-5 sm:px-6 pb-5 divide-y divide-rose-50">
            {last10.map((t) => {
              const Icon = TYPE_ICON[t.type];
              const isCredit = t.type === "credit";
              return (
                <div key={t.id} className="flex items-center gap-4 py-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-[#800A38]"}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.desc}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(t.date)} · {t.transactionNumber}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-slate-800"}`}>
                      {isCredit ? "+" : "−"}{formatCurrency(t.amount)}
                    </p>
                    <Badge tone={statusTone(t.status)} className="mt-1">{t.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
