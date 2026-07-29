import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Landmark, ArrowRight, CheckCircle2, User, Building2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import logo from "../../assets/logo.png";
import { formatCurrency, formatDateTime } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";
import walletService from "../../services/wallet.service";
import accountService from "../../services/account.service";
import transactionService from "../../services/transaction.service";

const TABS = [
  { id: "upi", label: "Transfer Money (UPI)", icon: Send },
  { id: "bank", label: "Bank Account → Wallet", icon: Landmark },
];

export default function TransferMoney() {
  const [tab, setTab] = useState("upi");
  const [receiverUpiId, setReceiverUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Money Transfer");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const [wallet, setWallet] = useState(null);
  const [primaryBank, setPrimaryBank] = useState(null);
  const [recentTransfers, setRecentTransfers] = useState([]);

  const loadData = async () => {
    try {
      const [w, accounts, txns] = await Promise.all([
        walletService.getMyWallet().catch(() => null),
        accountService.getAccounts().catch(() => []),
        transactionService.getMyTransactions().catch(() => []),
      ]);
      setWallet(w);
      setPrimaryBank(accounts.find((a) => a.isPrimary) || accounts[0] || null);
      setRecentTransfers(
        [...txns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
      );
    } catch {
      // handled individually above
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const canSubmit =
    amount &&
    Number(amount) > 0 &&
    (tab === "upi" ? receiverUpiId.trim().length > 3 : true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setConfirmOpen(true);
  };

  const confirmTransfer = async () => {
    setConfirmOpen(false);
    setSending(true);
    setError("");
    try {
      if (tab === "upi") {
        await transactionService.transferUpi({
          receiverUpiId: receiverUpiId.trim(),
          amount,
          description,
        });
      } else {
        await transactionService.depositFromBank({ amount, description });
      }
      setSending(false);
      setSuccessOpen(true);
      toast?.showToast(`${formatCurrency(Number(amount))} transferred successfully`, "success");
      loadData();
    } catch (err) {
      setSending(false);
      const msg = err?.response?.data?.message || "Transfer failed. Please try again.";
      setError(msg);
      toast?.showToast(msg, "error");
    }
  };

  const resetForm = () => {
    setSuccessOpen(false);
    setAmount("");
    setReceiverUpiId("");
    setDescription("Money Transfer");
  };

  return (
    <div>
      <PageHeader
        title="Transfer Money"
        crumb="Transfer Money"
        description="Send money instantly via UPI, or move money from your bank account into your wallet."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-rose-50/60 p-1.5 mb-6 w-full sm:w-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  tab === id ? "bg-[#800A38] text-white shadow-md shadow-[#800A38]/20" : "text-slate-500 hover:text-[#800A38]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {tab === "upi" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Receiver UPI ID">
                <input
                  type="text"
                  value={receiverUpiId}
                  onChange={(e) => setReceiverUpiId(e.target.value)}
                  placeholder="name@atlas"
                  className="input-text"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount (₹)">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-text"
                  />
                </Field>
                <Field label="Description">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Money Transfer"
                    className="input-text"
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-xs text-slate-500">
                <p className="font-bold text-slate-600 mb-1">Paying from</p>
                <p>Atlas Wallet · Available balance {wallet ? formatCurrency(wallet.availableBalance) : "—"}</p>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!canSubmit} icon={ArrowRight} iconPosition="right">
                Review Transfer
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">From Bank Account</p>
                {primaryBank ? (
                  <>
                    <p className="text-sm font-extrabold text-slate-900">{primaryBank.bankName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{primaryBank.branchName}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No linked bank account found. Add one from the Cards page.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount (₹)">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-text"
                  />
                </Field>
                <Field label="Description">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add money to wallet"
                    className="input-text"
                  />
                </Field>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!canSubmit} icon={ArrowRight} iconPosition="right">
                Add to Wallet
              </Button>
            </form>
          )}
          {error && <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>}
        </Card>

        {/* Recent transfers */}
        <Card noPadding>
          <h3 className="p-5 pb-3 text-sm font-bold text-slate-900">Recent Transfers</h3>
          <div className="px-5 pb-5 divide-y divide-rose-50">
            {recentTransfers.length === 0 && (
              <p className="py-4 text-xs text-slate-400">No transfers yet.</p>
            )}
            {recentTransfers.map((t) => (
              <div key={t._id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{t.description || t.type}</p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(t.createdAt)}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-slate-800">{formatCurrency(t.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Confirmation modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Transfer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmTransfer}>Confirm & Send</Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <Row label="Amount" value={formatCurrency(Number(amount) || 0)} highlight />
          <Row label="Transfer Type" value={TABS.find((t) => t.id === tab).label} />
          {tab === "upi" ? (
            <Row label="Receiver UPI ID" value={receiverUpiId || "—"} />
          ) : (
            <Row label="From" value={primaryBank ? primaryBank.bankName : "—"} />
          )}
          {description && <Row label="Description" value={description} />}
        </div>
      </Modal>

      {/* Sending animation — bank logo pulses center-screen while money "moves" */}
      <AnimatePresence>
        {sending && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
              <div className="relative flex w-full items-center justify-between">
                {/* Sender */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#800A38]">
                    <User className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">You</span>
                </div>

                {/* Bank logo, pulsing in the center */}
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-[#800A38]/20 border border-rose-100"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                >
                  <img src={logo} alt="Atlas Bank" className="h-9 w-9" />
                </motion.div>

                {/* Receiver */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#800A38]">
                    {tab === "upi" ? <Send className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                  </div>
                  <span className="max-w-[80px] truncate text-[10px] font-bold text-slate-500">
                    {tab === "upi" ? (receiverUpiId || "Receiver") : "Wallet"}
                  </span>
                </div>

                {/* Traveling coin, sweeps from sender to receiver and loops */}
                <motion.span
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#C4185C]"
                  initial={{ left: "12%", opacity: 0 }}
                  animate={{ left: ["12%", "88%"], opacity: [0, 1, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                />
              </div>

              <p className="mt-8 text-base font-extrabold text-slate-900">
                Sending {formatCurrency(Number(amount) || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Please wait, this usually takes a few seconds…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success modal */}
      <Modal open={successOpen} onClose={resetForm} title="Transfer Successful" footer={<Button className="w-full" onClick={resetForm}>Done</Button>}>
        <div className="flex flex-col items-center text-center py-4">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-4" />
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{formatCurrency(Number(amount) || 0)}</p>
          <p className="mt-1 text-sm text-slate-500">has been transferred successfully.</p>
          <Badge tone="success" className="mt-3">Reference ID: {recentTransfers[0]?.transactionNumber || "—"}</Badge>
        </div>
      </Modal>

      <style>{`
        .input-select, .input-text {
          width: 100%; border-radius: 0.75rem; border: 1px solid #f1d9e2; background: #fff;
          padding: 0.65rem 0.9rem; font-size: 0.875rem; color: #1e293b; outline: none; transition: all 0.15s;
        }
        .input-select:focus, .input-text:focus { border-color: #800A38; box-shadow: 0 0 0 3px rgba(128,10,56,0.08); }
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

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between border-b border-rose-50 pb-2.5">
      <span className="text-slate-500">{label}</span>
      <span className={highlight ? "text-lg font-extrabold text-[#800A38]" : "font-semibold text-slate-800"}>{value}</span>
    </div>
  );
}
