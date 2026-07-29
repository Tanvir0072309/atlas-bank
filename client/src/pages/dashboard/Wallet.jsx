import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useState as useStateAlias } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge, { statusTone } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { formatCurrency, formatDateTime } from "../../data/mockData";
import walletService from "../../services/wallet.service";
import accountService from "../../services/account.service";
import transactionService from "../../services/transaction.service";
import { useToast } from "../../components/ui/Toast";

// Human-friendly label + icon per ledger transaction type (matches the real schema).
const TYPE_META = {
  deposit: { label: "Deposit", direction: "credit", icon: ArrowDownRight },
  transfer: { label: "UPI Transfer", direction: "debit", icon: Send },
  withdraw: { label: "Withdrawal", direction: "debit", icon: ArrowUpRight },
};

export default function Wallet() {
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [primaryBank, setPrimaryBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [w, accounts, txns] = await Promise.all([
          walletService.getMyWallet().catch(() => null),
          accountService.getAccounts().catch(() => []),
          transactionService.getMyTransactions().catch(() => []),
        ]);
        setWallet(w);
        setPrimaryBank(accounts.find((a) => a.isPrimary) || accounts[0] || null);
        setTransactions(txns);
      } catch (err) {
        toast?.showToast(err?.response?.data?.message || "Could not load wallet", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const last10 = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
    [transactions]
  );

  const quickActions = [
    { label: "Send Money", icon: Send, onClick: () => navigate("/dashboard/transactions") },
    { label: "Add Money", icon: PlusCircle, onClick: () => navigate("/dashboard/transactions") },
    { label: "Bank Cards", icon: Landmark, onClick: () => navigate("/dashboard/cards") },
  ];

  return (
    <div>
      <PageHeader title="Wallet" crumb="Wallet" description="Your Atlas wallet balance, linked bank account, and recent activity." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Wallet balance card */}
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
            {hideBalance ? "•••••••" : formatCurrency(wallet?.availableBalance || 0)}
          </p>
          <p className="relative mt-2 text-xs text-rose-200">
            {wallet ? `UPI ID · ${wallet.upiId}` : loading ? "Loading wallet..." : "Wallet not set up yet"}
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

        {/* Linked bank account summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Linked Bank Account</span>
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            </div>
            {primaryBank ? (
              <>
                <p className="mt-4 text-lg font-extrabold text-slate-900">{primaryBank.bankName}</p>
                <p className="mt-1 text-xs text-slate-500">{primaryBank.accountHolderName}</p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Type</span>
                    <span className="font-semibold text-slate-700 capitalize">{primaryBank.accountType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IFSC</span>
                    <span className="font-semibold text-slate-700">{primaryBank.ifscCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Branch</span>
                    <span className="font-semibold text-slate-700">{primaryBank.branchName}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No bank account linked yet.</p>
            )}
            <Button variant="secondary" size="sm" className="mt-5 w-full" onClick={() => navigate("/dashboard/cards")}>
              Manage Bank Accounts
            </Button>
          </Card>
        </motion.div>
      </div>

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
              const meta = TYPE_META[t.type] || TYPE_META.transfer;
              const Icon = meta.icon;
              const isCredit = meta.direction === "credit";
              return (
                <div key={t._id} className="flex items-center gap-4 py-3.5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-[#800A38]"}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.description || meta.label}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(t.createdAt)} · {t.transactionNumber}</p>
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
