import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Copy, Landmark, ShieldCheck, Wifi } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { BANK_ACCOUNTS as INITIAL_ACCOUNTS } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

const GRADIENTS = [
  "from-[#800A38] via-[#6b0830] to-[#5C0526]",
  "from-[#1e293b] via-[#0f172a] to-[#020617]",
  "from-[#C4185C] via-[#9c1148] to-[#5C0526]",
];

function maskAccountNumber(number) {
  const clean = number.replace(/\s/g, "");
  return clean.replace(/.(?=.{4})/g, "•").replace(/(.{4})/g, "$1 ").trim();
}

function BankCard({ account, index, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  const toast = useToast();

  const copyDetails = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(account.accountNumber);
    toast?.showToast("Account number copied", "success");
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        className="relative h-52 w-full cursor-pointer [transform-style:preserve-3d] transition-transform duration-500"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} p-5 text-white shadow-xl shadow-black/20 [backface-visibility:hidden]`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Atlas Linked Account</p>
              <p className="mt-1 text-sm font-extrabold">{account.bankName}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Landmark className="h-4.5 w-4.5" />
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold tracking-[0.15em]">{maskAccountNumber(account.accountNumber)}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/50">Account Holder</p>
                <p className="text-sm font-bold">{account.accountHolderName}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-white/50">Type</p>
                <p className="text-sm font-bold capitalize">{account.accountType}</p>
              </div>
              <Wifi className="h-5 w-5 rotate-90 text-white/70" />
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-3xl bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} p-5 text-white shadow-xl shadow-black/20 [backface-visibility:hidden]`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-9 w-full rounded bg-black/40 mt-1" />
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-white/60">IFSC Code</span><span className="font-bold">{account.ifscCode}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Branch</span><span className="font-bold">{account.branchName}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Full A/C No.</span><span className="font-bold">{account.accountNumber}</span></div>
          </div>
          <p className="text-[9px] text-white/50">Tap card to flip back</p>
        </div>
      </motion.div>

      {/* Action buttons under the card */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={copyDetails}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-white py-2 text-[11px] font-bold text-slate-600 hover:bg-rose-50 hover:text-[#800A38] transition-colors"
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f); }}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-white py-2 text-[11px] font-bold text-slate-600 hover:bg-rose-50 hover:text-[#800A38] transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Flip
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-white py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

export default function Cards() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountType: "savings",
  });
  const toast = useToast();

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = (e) => {
    e.preventDefault();
    setAccounts((prev) => [...prev, { id: `bank_${Date.now()}`, ...form }]);
    toast?.showToast("Bank account added successfully", "success");
    setAddOpen(false);
    setForm({ accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", branchName: "", accountType: "savings" });
  };

  const confirmDelete = () => {
    setAccounts((prev) => prev.filter((a) => a.id !== deleteId));
    toast?.showToast("Bank account removed", "success");
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Cards"
        crumb="Cards"
        description="Manage the bank accounts linked to your Atlas wallet."
        action={<Button icon={PlusCircle} onClick={() => setAddOpen(true)}>Add Bank Account</Button>}
      />

      {accounts.length === 0 ? (
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
                key={account.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <BankCard account={account} index={i} onDelete={setDeleteId} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add bank account modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Bank Account">
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="Account Holder Name">
            <input required value={form.accountHolderName} onChange={updateField("accountHolderName")} className="input-text" placeholder="Tanvir Khan" />
          </Field>
          <Field label="Account Number">
            <input required value={form.accountNumber} onChange={updateField("accountNumber")} className="input-text" placeholder="456789012345" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IFSC Code">
              <input required value={form.ifscCode} onChange={updateField("ifscCode")} className="input-text" placeholder="UTIB0007890" />
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
            <Button type="submit">Add Account</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove Bank Account?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">This bank account will no longer be available for adding money to your wallet.</p>
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
