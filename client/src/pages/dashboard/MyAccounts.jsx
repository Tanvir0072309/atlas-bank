import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Landmark, ChevronRight, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge, { statusTone } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { useBankingData } from "../../hooks/useBankingData";
import { formatCurrency } from "../../utils/transactions";
import { accountService } from "../../services/account.service";
import { useToast } from "../../components/ui/Toast";

export default function MyAccounts() {
  const { accounts, loading, refresh } = useBankingData();
  const [selected, setSelected] = useState(null);
  const [openAccOpen, setOpenAccOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await accountService.deleteAccount(deleteTarget._id);
      toast?.showToast("Bank account deleted successfully.", "success");
      setDeleteTarget(null);
      setSelected(null);
      refresh();
    } catch (error) {
      toast?.showToast(
        error?.response?.data?.message || "Could not delete this account. Please try again.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
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

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No bank accounts yet"
          description="Link a bank account to start sending and receiving money."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{a.accountType}</p>
                    <h3 className="mt-1 text-base font-extrabold text-slate-900">{a.bankName}</h3>
                  </div>
                  {a.isPrimary && <Badge tone="primary">Primary</Badge>}
                </div>

                <p className="mt-5 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(a.availableBalance)}
                </p>
                <p className="text-xs text-slate-400">Available Balance</p>

                <div className="mt-5 space-y-2 rounded-2xl bg-rose-50/50 border border-rose-100 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Holder</span>
                    <span className="font-semibold text-slate-800">{a.accountHolderName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">IFSC Code</span>
                    <span className="font-semibold text-slate-800">{a.ifscCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Branch</span>
                    <span className="font-semibold text-slate-800">{a.branchName}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                      aria-label="Delete account"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                    <button
                      onClick={() => setSelected(a)}
                      className="flex items-center gap-1 text-xs font-bold text-[#800A38] hover:underline"
                    >
                      View details <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Account details modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.bankName} maxWidth="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#800A38] to-[#5C0526] p-5 text-white">
              <Landmark className="h-8 w-8 text-rose-200" />
              <div>
                <p className="text-xs text-rose-200">{selected.accountType}</p>
                <p className="text-lg sm:text-xl font-extrabold">{formatCurrency(selected.availableBalance)}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Account Holder", selected.accountHolderName],
                ["IFSC Code", selected.ifscCode],
                ["Branch", selected.branchName],
                ["Status", selected.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex justify-end pt-2">
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(selected)}>
                Delete this account
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete bank account?">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {deleteTarget?.isPrimary ? (
              <>
                <strong>{deleteTarget?.bankName}</strong> is your primary account. Set another account as primary
                before deleting it.
              </>
            ) : (
              <>
                This will remove <strong>{deleteTarget?.bankName}</strong> ({deleteTarget?.accountType}) from your
                profile. This action cannot be undone.
              </>
            )}
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            size="md"
            icon={Trash2}
            onClick={handleDelete}
            disabled={deleting || deleteTarget?.isPrimary}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
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
