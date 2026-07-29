import { useEffect, useMemo, useState } from "react";
import { Send, Landmark, ArrowRight, ArrowUpRight, ArrowDownRight, Receipt, RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { statusTone } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { formatCurrency, formatDateTime } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";
import transactionService from "../../services/transaction.service";

const PAGE_SIZE = 8;

const TYPE_META = {
  deposit: { label: "Bank → Wallet Deposit", direction: "credit" },
  transfer: { label: "UPI Transfer", direction: "debit" },
  withdraw: { label: "Wallet → Bank Withdrawal", direction: "debit" },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  // Form 1 — UPI transfer
  const [upiReceiver, setUpiReceiver] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [upiDesc, setUpiDesc] = useState("Money Transfer");
  const [upiSubmitting, setUpiSubmitting] = useState(false);

  // Form 2 — Bank to wallet
  const [bankAmount, setBankAmount] = useState("");
  const [bankDesc, setBankDesc] = useState("Added money to wallet");
  const [bankSubmitting, setBankSubmitting] = useState(false);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getMyTransactions();
      setTransactions(data);
    } catch (err) {
      toast?.showToast(err?.response?.data?.message || "Could not load transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [transactions]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submitUpiTransfer = async (e) => {
    e.preventDefault();
    if (!upiReceiver.trim() || !upiAmount || Number(upiAmount) <= 0) return;
    setUpiSubmitting(true);
    try {
      await transactionService.transferUpi({
        receiverUpiId: upiReceiver.trim(),
        amount: upiAmount,
        description: upiDesc,
      });
      toast?.showToast(`${formatCurrency(Number(upiAmount))} sent via UPI`, "success");
      setUpiReceiver("");
      setUpiAmount("");
      setUpiDesc("Money Transfer");
      loadTransactions();
    } catch (err) {
      toast?.showToast(err?.response?.data?.message || "UPI transfer failed", "error");
    } finally {
      setUpiSubmitting(false);
    }
  };

  const submitBankToWallet = async (e) => {
    e.preventDefault();
    if (!bankAmount || Number(bankAmount) <= 0) return;
    setBankSubmitting(true);
    try {
      await transactionService.depositFromBank({
        amount: bankAmount,
        description: bankDesc,
      });
      toast?.showToast(`${formatCurrency(Number(bankAmount))} added to wallet`, "success");
      setBankAmount("");
      setBankDesc("Added money to wallet");
      loadTransactions();
    } catch (err) {
      toast?.showToast(err?.response?.data?.message || "Deposit failed", "error");
    } finally {
      setBankSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        crumb="Transactions"
        description="Send money and review your complete transaction history — pulled live from your account."
        action={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadTransactions}>
            Refresh
          </Button>
        }
      />

      {/* Two transfer forms, in place of the old filter bar */}
      <div className="grid gap-5 lg:grid-cols-2 mb-5">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Send className="h-4 w-4 text-[#800A38]" /> UPI Transfer
          </h3>
          <form onSubmit={submitUpiTransfer} className="space-y-4">
            <Field label="Receiver UPI ID">
              <input
                type="text"
                value={upiReceiver}
                onChange={(e) => setUpiReceiver(e.target.value)}
                placeholder="name@atlas"
                className="input-text"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount (₹)">
                <input type="number" min="1" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} placeholder="0.00" className="input-text" required />
              </Field>
              <Field label="Description">
                <input type="text" value={upiDesc} onChange={(e) => setUpiDesc(e.target.value)} placeholder="Money Transfer" className="input-text" />
              </Field>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={upiSubmitting} icon={ArrowRight} iconPosition="right">
              {upiSubmitting ? "Sending..." : "Send via UPI"}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Landmark className="h-4 w-4 text-[#800A38]" /> Bank Account → Wallet
          </h3>
          <form onSubmit={submitBankToWallet} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount (₹)">
                <input type="number" min="1" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} placeholder="0.00" className="input-text" required />
              </Field>
              <Field label="Description">
                <input type="text" value={bankDesc} onChange={(e) => setBankDesc(e.target.value)} placeholder="Added money to wallet" className="input-text" />
              </Field>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={bankSubmitting} icon={ArrowRight} iconPosition="right">
              {bankSubmitting ? "Adding..." : "Add to Wallet"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-5 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Receipt} title="No transactions yet" description="Send money or add funds using the forms above to see activity here." />
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rose-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((t) => {
                    const meta = TYPE_META[t.type] || { label: t.type, direction: "debit" };
                    const isCredit = meta.direction === "credit";
                    return (
                      <tr key={t._id} onClick={() => setSelected(t)} className="cursor-pointer border-b border-rose-50 last:border-0 hover:bg-rose-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{t.description || meta.label}</td>
                        <td className="px-5 py-3.5 text-slate-500">{formatDateTime(t.createdAt)}</td>
                        <td className="px-5 py-3.5 text-slate-500">{meta.label}</td>
                        <td className="px-5 py-3.5"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                        <td className={`px-5 py-3.5 text-right font-bold ${isCredit ? "text-emerald-600" : "text-slate-800"}`}>
                          {isCredit ? "+" : "−"}{formatCurrency(t.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-rose-50">
              {paged.map((t) => {
                const meta = TYPE_META[t.type] || { label: t.type, direction: "debit" };
                const isCredit = meta.direction === "credit";
                return (
                  <button key={t._id} onClick={() => setSelected(t)} className="flex w-full items-center gap-3 p-4 text-left">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-[#800A38]"}`}>
                      {isCredit ? <ArrowDownRight className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{t.description || meta.label}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <p className={`shrink-0 text-sm font-bold ${isCredit ? "text-emerald-600" : "text-slate-800"}`}>{formatCurrency(t.amount)}</p>
                  </button>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-rose-100 px-5 py-4">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-rose-100 p-1.5 text-slate-500 hover:bg-rose-50 disabled:opacity-40">
                  Prev
                </button>
                <span className="text-xs font-semibold text-slate-600">{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-rose-100 p-1.5 text-slate-500 hover:bg-rose-50 disabled:opacity-40">
                  Next
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
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{formatCurrency(selected.amount)}</p>
              <p className="mt-1 text-xs text-slate-500">{selected.description || TYPE_META[selected.type]?.label}</p>
            </div>
            {[
              ["Transaction No.", selected.transactionNumber],
              ["Date & Time", formatDateTime(selected.createdAt)],
              ["Type", TYPE_META[selected.type]?.label || selected.type],
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
