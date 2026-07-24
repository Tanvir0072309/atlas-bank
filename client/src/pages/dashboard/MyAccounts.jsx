import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Plus, Landmark, ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge, { statusTone } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { ACCOUNTS, formatCurrency } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

export default function MyAccounts() {
  const [revealed, setRevealed] = useState({});
  const [selected, setSelected] = useState(null);
  const [openAccOpen, setOpenAccOpen] = useState(false);
  const toast = useToast();

  const toggleReveal = (id) => setRevealed((r) => ({ ...r, [id]: !r[id] }));

  const copyNumber = (number) => {
    navigator.clipboard?.writeText(number.replace(/\s/g, ""));
    toast?.showToast("Account number copied to clipboard", "success");
  };

  return (
    <div>
      <PageHeader
        title="My Accounts"
        crumb="My Accounts"
        description="View and manage all your Atlas Bank accounts in one place."
        action={
          <Button icon={Plus} onClick={() => setOpenAccOpen(true)}>
            Open New Account
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ACCOUNTS.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="h-full flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{a.type}</p>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900">{a.nickname}</h3>
                </div>
                {a.isPrimary && <Badge tone="primary">Primary</Badge>}
              </div>

              <p className="mt-5 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(a.balance)}</p>
              <p className="text-xs text-slate-400">Available Balance</p>

              <div className="mt-5 space-y-2 rounded-2xl bg-rose-50/50 border border-rose-100 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account Number</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>{revealed[a.id] ? a.number : a.masked}</span>
                    <button onClick={() => toggleReveal(a.id)} className="text-slate-400 hover:text-[#800A38]">
                      {revealed[a.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => copyNumber(a.number)} className="text-slate-400 hover:text-[#800A38]">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">IFSC Code</span>
                  <span className="font-semibold text-slate-800">{a.ifsc}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Branch</span>
                  <span className="font-semibold text-slate-800">{a.branch}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                <button
                  onClick={() => setSelected(a)}
                  className="flex items-center gap-1 text-xs font-bold text-[#800A38] hover:underline"
                >
                  View details <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Account details modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.nickname} maxWidth="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#800A38] to-[#5C0526] p-5 text-white">
              <Landmark className="h-8 w-8 text-rose-200" />
              <div>
                <p className="text-xs text-rose-200">{selected.type}</p>
                <p className="text-lg sm:text-xl font-extrabold">{formatCurrency(selected.balance)}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Account Number", selected.number],
                ["IFSC Code", selected.ifsc],
                ["Branch", selected.branch],
                ["Status", selected.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>

      {/* Open new account modal (future feature) */}
      <Modal
        open={openAccOpen}
        onClose={() => setOpenAccOpen(false)}
        title="Open a New Account"
        footer={<Button variant="secondary" onClick={() => setOpenAccOpen(false)}>Close</Button>}
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          Opening new accounts digitally is coming soon. Visit your nearest Atlas Bank branch or
          contact support to open a Fixed Deposit, Recurring Deposit, or additional Savings account today.
        </p>
      </Modal>
    </div>
  );
}
