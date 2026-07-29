import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Send,
  Landmark,
  ArrowRightLeft,
  CheckCircle2,
  User,
  AlertCircle,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { statusTone } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { useBankingData } from "../../hooks/useBankingData";
import { formatCurrency, formatDateTime } from "../../utils/transactions";
import transactionService from "../../services/transaction.service";
import logo from "../../assets/logo.png";
import { useToast } from "../../components/ui/Toast";

const PAGE_SIZE = 8;

const TABS = [
  { id: "upi", label: "UPI to UPI", icon: Send },
  { id: "bank", label: "Bank ⇄ Wallet", icon: ArrowRightLeft },
];

export default function Transactions() {
  const { wallet, accounts, normalizedTransactions, loading, refresh } = useBankingData();

  // ------- New Transaction panel -------
  const [txOpen, setTxOpen] = useState(false);
  const [tab, setTab] = useState("upi");
  const [direction, setDirection] = useState("bank_to_wallet"); // or "wallet_to_bank"
  const [receiverUpiId, setReceiverUpiId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingAnim, setSendingAnim] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [formError, setFormError] = useState("");
  const toast = useToast();

  const activeAccounts = accounts.filter((a) => a.status === "active");

  const resetTxForm = () => {
    setReceiverUpiId(""); setAccountId(""); setAmount(""); setDescription(""); setFormError("");
  };

  const canSubmit =
    amount &&
    Number(amount) > 0 &&
    (tab === "upi" ? receiverUpiId.trim().length > 3 : !!accountId);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setFormError("");
    setSubmitting(true);
    setSendingAnim(true);
    try {
      let result;
      if (tab === "upi") {
        result = await transactionService.transferUpi({ receiverUpiId, amount: Number(amount), description });
      } else if (direction === "bank_to_wallet") {
        result = await transactionService.bankToWallet({ accountId, amount: Number(amount), description });
      } else {
        result = await transactionService.withdraw({ amount: Number(amount), description, accountId });
      }
      setSuccessInfo({ amount: Number(amount), transactionNumber: result?.transactionNumber });
      resetTxForm();
      await refresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || "This transfer could not be completed.");
    } finally {
      setSubmitting(false);
      setSendingAnim(false);
    }
  };

  const closeAll = () => {
    setSuccessInfo(null);
    setTxOpen(false);
  };

  // ------- Filters & history -------
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return normalizedTransactions.filter((t) => {
      if (query && !t.desc.toLowerCase().includes(query.toLowerCase()) && !t.transactionNumber?.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.date) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [normalizedTransactions, query, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setQuery(""); setTypeFilter("all"); setDateFrom(""); setDateTo(""); setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        crumb="Transactions"
        description="Send money, move funds between your bank and wallet, and browse your complete history."
        action={<Button icon={Send} onClick={() => { resetTxForm(); setTxOpen(true); }}>New Transaction</Button>}
      />

      {/* Filters */}
      <Card className="mb-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block lg:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search description or ID..." className="w-full rounded-xl border border-rose-100 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Type</span>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="w-full rounded-xl border border-rose-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]">
              <option value="all">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">From Date</span>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-full rounded-xl border border-rose-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">To Date</span>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-full rounded-xl border border-rose-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
          </label>
          <div className="flex items-end lg:col-span-5 lg:justify-end">
            <Button variant="ghost" size="md" onClick={resetFilters}>Clear Filters</Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Receipt} title="No transactions found" description="Try adjusting your filters, or send your first transfer." action={<Button size="sm" onClick={resetFilters}>Clear Filters</Button>} />
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rose-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Mode</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t) => (
                    <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer border-b border-rose-50 last:border-0 hover:bg-rose-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{t.desc}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDateTime(t.date)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{t.mode}</td>
                      <td className="px-5 py-3.5"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                      <td className={`px-5 py-3.5 text-right font-bold ${t.type === "credit" ? "text-emerald-600" : "text-slate-800"}`}>
                        {t.type === "credit" ? "+" : "−"}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-rose-50">
              {paged.map((t) => (
                <button key={t.id} onClick={() => setSelected(t)} className="flex w-full items-center gap-3 p-4 text-left">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-[#800A38]"}`}>
                    {t.type === "credit" ? <ArrowDownRight className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.desc}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(t.date)}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-bold ${t.type === "credit" ? "text-emerald-600" : "text-slate-800"}`}>{formatCurrency(t.amount)}</p>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-rose-100 px-5 py-4">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-rose-100 p-1.5 text-slate-500 hover:bg-rose-50 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600">{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-rose-100 p-1.5 text-slate-500 hover:bg-rose-50 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Details modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Transaction Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-4 text-center mb-2">
              <p className={`text-xl sm:text-2xl font-extrabold ${selected.type === "credit" ? "text-emerald-600" : "text-slate-900"}`}>
                {selected.type === "credit" ? "+" : "−"}{formatCurrency(selected.amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{selected.desc}</p>
            </div>
            {[
              ["Transaction No.", selected.transactionNumber || "—"],
              ["Date & Time", formatDateTime(selected.date)],
              ["Category", selected.category],
              ["Mode", selected.mode],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-rose-50 pb-2.5">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Status</span>
              <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
            </div>
          </div>
        )}
      </Modal>

      {/* New Transaction modal */}
      <Modal open={txOpen} onClose={() => setTxOpen(false)} title="New Transaction">
        <div className="flex gap-2 rounded-2xl bg-rose-50/60 p-1.5 mb-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setFormError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                tab === id ? "bg-[#800A38] text-white shadow-md shadow-[#800A38]/20" : "text-slate-500 hover:text-[#800A38]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {formError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {formError}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          {tab === "upi" ? (
            <Field label="Receiver UPI ID">
              <input required value={receiverUpiId} onChange={(e) => setReceiverUpiId(e.target.value)} placeholder="name@atlas" className="input-text" />
            </Field>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-rose-50/60 p-1.5">
                <button type="button" onClick={() => setDirection("bank_to_wallet")} className={`rounded-xl py-2 text-xs font-bold transition-all ${direction === "bank_to_wallet" ? "bg-white shadow text-[#800A38]" : "text-slate-500"}`}>
                  Bank → Wallet
                </button>
                <button type="button" onClick={() => setDirection("wallet_to_bank")} className={`rounded-xl py-2 text-xs font-bold transition-all ${direction === "wallet_to_bank" ? "bg-white shadow text-[#800A38]" : "text-slate-500"}`}>
                  Wallet → Bank
                </button>
              </div>

              {activeAccounts.length === 0 ? (
                <p className="text-xs text-slate-500">No active bank account found. Add one from the Cards page first.</p>
              ) : (
                <Field label={direction === "bank_to_wallet" ? "From Bank Account" : "To Bank Account"}>
                  <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input-text">
                    <option value="" disabled>Select an account</option>
                    {activeAccounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.bankName} · {a.accountNumber || "linked"}</option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (₹)">
              <input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="input-text" />
            </Field>
            <Field label="Description (optional)">
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Money Transfer" className="input-text" />
            </Field>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-xs text-slate-500">
            Available wallet balance: <span className="font-bold text-slate-700">{wallet ? formatCurrency(wallet.availableBalance) : "—"}</span>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || submitting}>
            {submitting ? "Processing..." : "Send"}
          </Button>
        </form>
      </Modal>

      {/* Sending animation */}
      <AnimatePresence>
        {sendingAnim && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
              <div className="relative flex w-full items-center justify-between">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#800A38]"><User className="h-6 w-6" /></div>
                  <span className="text-[10px] font-bold text-slate-500">You</span>
                </div>
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-[#800A38]/20 border border-rose-100"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                >
                  <img src={logo} alt="Atlas Bank" className="h-9 w-9" />
                </motion.div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#800A38]">
                    {tab === "upi" ? <Send className="h-6 w-6" /> : <Landmark className="h-6 w-6" />}
                  </div>
                  <span className="max-w-[80px] truncate text-[10px] font-bold text-slate-500">
                    {tab === "upi" ? (receiverUpiId || "Receiver") : "Bank"}
                  </span>
                </div>
                <motion.span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#C4185C]"
                  initial={{ left: "12%", opacity: 0 }}
                  animate={{ left: ["12%", "88%"], opacity: [0, 1, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                />
              </div>
              <p className="mt-8 text-base font-extrabold text-slate-900">Sending {formatCurrency(Number(amount) || 0)}</p>
              <p className="mt-1 text-xs text-slate-500">Please wait, this usually takes a few seconds…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success modal */}
      <Modal open={!!successInfo} onClose={closeAll} title="Transfer Successful" footer={<Button className="w-full" onClick={closeAll}>Done</Button>}>
        {successInfo && (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-4" />
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{formatCurrency(successInfo.amount)}</p>
            <p className="mt-1 text-sm text-slate-500">has been transferred successfully.</p>
            {successInfo.transactionNumber && (
              <Badge tone="success" className="mt-3">Ref: {successInfo.transactionNumber}</Badge>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .input-text {
          width: 100%; border-radius: 0.75rem; border: 1px solid #f1d9e2; background: #fff;
          padding: 0.65rem 0.9rem; font-size: 0.875rem; color: #1e293b; outline: none; transition: all 0.15s;
        }
        .input-text:focus { border-color: #800A38; box-shadow: 0 0 0 3px rgba(128,10,56,0.08); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
