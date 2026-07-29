import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Star, Landmark, AlertCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Badge, { statusTone } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import accountService from "../../services/account.service";
import { useToast } from "../../components/ui/Toast";

const GRADIENTS = [
  "from-[#800A38] via-[#6b0830] to-[#5C0526]",
  "from-[#1e293b] via-[#0f172a] to-[#020617]",
  "from-[#C4185C] via-[#9c1148] to-[#5C0526]",
  "from-[#0f766e] via-[#115e59] to-[#022c22]",
];

const emptyForm = {
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  accountType: "savings",
};

export default function Cards() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (err) {
      toast?.showToast(err?.response?.data?.message || "Could not load bank accounts.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await accountService.createAccount(form);
      toast?.showToast("Bank account added successfully", "success");
      setAddOpen(false);
      setForm(emptyForm);
      await loadAccounts();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Could not add this bank account.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await accountService.deleteAccount(deleteTarget._id);
      toast?.showToast("Bank account removed", "success");
      setDeleteTarget(null);
      await loadAccounts();
    } catch (err) {
      toast?.showToast(err?.response?.data?.message || "Could not remove this account.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const makePrimary = async (account) => {
    try {
      await accountService.setPrimaryAccount(account._id);
      toast?.showToast(`${account.bankName} set as primary account`, "success");
      await loadAccounts();
    } catch (err) {
      toast?.showToast(err?.response?.data?.message || "Could not update primary account.", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Cards"
        crumb="Cards"
        description="Manage the bank accounts linked to your Atlas wallet."
        action={
          <Button icon={PlusCircle} onClick={() => { setForm(emptyForm); setFormError(""); setAddOpen(true); }}>
            Add Bank Account
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Landmark}
            title="No bank accounts linked"
            description="Add a bank account to fund your wallet and receive transfers."
            action={<Button icon={PlusCircle} onClick={() => setAddOpen(true)}>Add Bank Account</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {accounts.map((account, i) => (
              <motion.div
                key={account._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative flex flex-col justify-between rounded-3xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-5 text-white shadow-xl shadow-black/20 min-h-[190px]`}
              >
                {account.isPrimary && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    <Star className="h-3 w-3 fill-current" /> Primary
                  </span>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Atlas Linked Account</p>
                  <p className="mt-1 text-base font-extrabold">{account.bankName}</p>
                  <p className="mt-0.5 text-xs text-white/70">{account.accountHolderName}</p>
                </div>

                <div>
                  <p className="text-lg font-semibold tracking-[0.15em]">
                    {account.accountNumber || "•••• ••••"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
                    <span>{account.ifscCode}</span>
                    <span className="capitalize">{account.accountType}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-white/70">{account.branchName}</div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={statusTone(account.status)} className="capitalize">{account.status}</Badge>
                  <span className="text-sm font-bold">
                    ₹{Number(account.availableBalance || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    disabled={account.isPrimary}
                    onClick={() => makePrimary(account)}
                    className="rounded-xl bg-white/10 py-2 text-[11px] font-bold hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Make Primary
                  </button>
                  <button
                    onClick={() => setDeleteTarget(account)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-[11px] font-bold text-white hover:bg-red-500/80 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add bank account modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Bank Account">
        <form onSubmit={handleAdd} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {formError}
            </div>
          )}
          <Field label="Account Holder Name">
            <input required minLength={3} value={form.accountHolderName} onChange={updateField("accountHolderName")} className="input-text" placeholder="Tanvir Khan" />
          </Field>
          <Field label="Account Number">
            <input required pattern="[0-9]{9,18}" title="9 to 18 digits" value={form.accountNumber} onChange={updateField("accountNumber")} className="input-text" placeholder="456789012345" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IFSC Code">
              <input required pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}" title="e.g. UTIB0007890" value={form.ifscCode} onChange={updateField("ifscCode")} className="input-text uppercase" placeholder="UTIB0007890" />
            </Field>
            <Field label="Bank Name">
              <input required value={form.bankName} onChange={updateField("bankName")} className="input-text" placeholder="Axis Bank" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Branch Name">
              <input required value={form.branchName} onChange={updateField("branchName")} className="input-text" placeholder="Vadodara" />
            </Field>
            <Field label="Account Type">
              <select value={form.accountType} onChange={updateField("accountType")} className="input-text">
                <option value="savings">Savings</option>
                <option value="current">Current</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add Account"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Bank Account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete} disabled={deleting}>{deleting ? "Removing..." : "Remove"}</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {deleteTarget?.bankName} · {deleteTarget?.accountNumber || "this account"} will no longer be available for adding money to your wallet.
          {deleteTarget?.isPrimary && " Another linked account (if any) will automatically become your primary account."}
        </p>
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
