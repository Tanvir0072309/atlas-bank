import { useState } from "react";
import { Search, Plus, Pencil, Trash2, ShieldCheck, ShieldAlert, Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { BENEFICIARIES as INITIAL } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

const emptyForm = { nickname: "", name: "", bank: "", account: "", ifsc: "" };

export default function Beneficiaries() {
  const [list, setList] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const filtered = list.filter((b) =>
    [b.name, b.nickname, b.bank].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm(b); setFormOpen(true); };

  const saveForm = (e) => {
    e.preventDefault();
    if (editing) {
      setList((l) => l.map((b) => (b.id === editing.id ? { ...editing, ...form } : b)));
      toast?.showToast("Beneficiary updated successfully", "success");
    } else {
      setList((l) => [{ id: `ben_${Date.now()}`, verified: false, ...form }, ...l]);
      toast?.showToast("Beneficiary added — verification pending", "info");
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    setList((l) => l.filter((b) => b.id !== deleteTarget.id));
    toast?.showToast("Beneficiary removed", "success");
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        title="Beneficiaries"
        crumb="Beneficiaries"
        description="Manage the people and accounts you send money to."
        action={<Button icon={Plus} onClick={openAdd}>Add Beneficiary</Button>}
      />

      <Card noPadding className="mb-5">
        <div className="p-5 pb-0">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or bank..."
              className="w-full rounded-xl border border-rose-100 bg-rose-50/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="No beneficiaries found" description="Try a different search, or add a new beneficiary to get started." action={<Button size="sm" icon={Plus} onClick={openAdd}>Add Beneficiary</Button>} />
          </div>
        ) : (
          <div className="mt-3 divide-y divide-rose-50">
            {filtered.map((b) => (
              <div key={b.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#800A38] to-[#C4185C] text-sm font-bold text-white">
                    {b.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{b.nickname}</p>
                    <p className="truncate text-xs text-slate-500">{b.name} · {b.bank} · {b.account}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 sm:justify-end">
                  {b.verified ? (
                    <Badge tone="success"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                  ) : (
                    <Badge tone="pending"><ShieldAlert className="h-3 w-3" /> Pending</Badge>
                  )}
                  <button onClick={() => openEdit(b)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-[#800A38]"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(b)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Beneficiary" : "Add Beneficiary"}>
        <form onSubmit={saveForm} className="space-y-4">
          {[
            ["nickname", "Nickname", "e.g. Rohan"],
            ["name", "Full Name", "As per bank records"],
            ["bank", "Bank Name", "e.g. HDFC Bank"],
            ["account", "Account Number", "XXXX XXXX 1234"],
            ["ifsc", "IFSC Code", "e.g. HDFC0001234"],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
              <input
                required
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-xl border border-rose-100 bg-white py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]"
              />
            </label>
          ))}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Beneficiary"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Beneficiary"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to remove <strong>{deleteTarget?.nickname}</strong> from your beneficiaries? You'll need to add and verify them again to send money in future.
        </p>
      </Modal>
    </div>
  );
}
