import { useState, useMemo } from "react";
import { Repeat, Users, Landmark, ArrowRight, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { ACCOUNTS, BENEFICIARIES, TRANSACTIONS, formatCurrency, formatDateTime } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

const TABS = [
  { id: "own", label: "Own Accounts", icon: Repeat },
  { id: "atlas", label: "Atlas Customer", icon: Users },
  { id: "bank", label: "Other Bank", icon: Landmark },
];

export default function TransferMoney() {
  const [tab, setTab] = useState("own");
  const [fromAcc, setFromAcc] = useState(ACCOUNTS[0].id);
  const [toAcc, setToAcc] = useState(ACCOUNTS[1].id);
  const [beneficiary, setBeneficiary] = useState(BENEFICIARIES[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const toast = useToast();

  const recentTransfers = useMemo(() => TRANSACTIONS.filter((t) => t.category === "Transfer").slice(0, 5), []);

  const canSubmit = amount && Number(amount) > 0 && (tab !== "own" ? beneficiary : fromAcc !== toAcc);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setConfirmOpen(true);
  };

  const confirmTransfer = () => {
    setConfirmOpen(false);
    setSuccessOpen(true);
    toast?.showToast(`${formatCurrency(Number(amount))} transferred successfully`, "success");
  };

  const resetForm = () => {
    setSuccessOpen(false);
    setAmount("");
    setRemarks("");
  };

  return (
    <div>
      <PageHeader title="Transfer Money" crumb="Transfer Money" description="Move money between your accounts or send it to someone else, instantly." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 rounded-2xl bg-rose-50/60 p-1.5 mb-6 w-full sm:w-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  tab === id ? "bg-[#800A38] text-white shadow-md shadow-[#800A38]/20" : "text-slate-500 hover:text-[#800A38]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === "own" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="From Account">
                  <select value={fromAcc} onChange={(e) => setFromAcc(e.target.value)} className="input-select">
                    {ACCOUNTS.map((a) => (
                      <option key={a.id} value={a.id}>{a.nickname} · {a.masked}</option>
                    ))}
                  </select>
                </Field>
                <Field label="To Account">
                  <select value={toAcc} onChange={(e) => setToAcc(e.target.value)} className="input-select">
                    {ACCOUNTS.filter((a) => a.id !== fromAcc).map((a) => (
                      <option key={a.id} value={a.id}>{a.nickname} · {a.masked}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {(tab === "atlas" || tab === "bank") && (
              <Field label={tab === "atlas" ? "Select Atlas Customer / Beneficiary" : "Select Beneficiary Bank Account"}>
                <select value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="input-select">
                  <option value="">Choose a beneficiary</option>
                  {BENEFICIARIES.map((b) => (
                    <option key={b.id} value={b.id}>{b.nickname} · {b.bank} · {b.account}</option>
                  ))}
                </select>
              </Field>
            )}

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
              <Field label="Remarks (optional)">
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Rent, groceries..."
                  className="input-text"
                />
              </Field>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!canSubmit} icon={ArrowRight} iconPosition="right">
              Review Transfer
            </Button>
          </form>
        </Card>

        {/* Recent transfers */}
        <Card noPadding>
          <h3 className="p-5 pb-3 text-sm font-bold text-slate-900">Recent Transfers</h3>
          <div className="px-5 pb-5 divide-y divide-rose-50">
            {recentTransfers.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{t.desc}</p>
                  <p className="text-[11px] text-slate-400">{formatDateTime(t.date)}</p>
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
          {tab === "own" ? (
            <>
              <Row label="From" value={ACCOUNTS.find((a) => a.id === fromAcc)?.nickname} />
              <Row label="To" value={ACCOUNTS.find((a) => a.id === toAcc)?.nickname} />
            </>
          ) : (
            <Row label="Beneficiary" value={BENEFICIARIES.find((b) => b.id === beneficiary)?.nickname} />
          )}
          {remarks && <Row label="Remarks" value={remarks} />}
        </div>
      </Modal>

      {/* Success modal */}
      <Modal open={successOpen} onClose={resetForm} title="Transfer Successful" footer={<Button className="w-full" onClick={resetForm}>Done</Button>}>
        <div className="flex flex-col items-center text-center py-4">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-4" />
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{formatCurrency(Number(amount) || 0)}</p>
          <p className="mt-1 text-sm text-slate-500">has been transferred successfully.</p>
          <Badge tone="success" className="mt-3">Reference ID: TXN{Math.floor(Math.random() * 900000 + 100000)}</Badge>
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
