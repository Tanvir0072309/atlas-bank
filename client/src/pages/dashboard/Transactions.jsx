import { useMemo, useState } from "react";
import { Search, Download, FileText, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { statusTone } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TRANSACTIONS, formatCurrency, formatDateTime } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

const PAGE_SIZE = 6;

export default function Transactions() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      if (query && !t.desc.toLowerCase().includes(query.toLowerCase())) return false;
      if (type !== "all" && t.type !== type) return false;
      if (minAmount && t.amount < Number(minAmount)) return false;
      if (maxAmount && t.amount > Number(maxAmount)) return false;
      if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.date) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [query, type, minAmount, maxAmount, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setQuery(""); setType("all"); setMinAmount(""); setMaxAmount(""); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const handleExport = (format) => {
    toast?.showToast(`Exporting ${filtered.length} transactions as ${format.toUpperCase()}...`, "info");
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        crumb="Transactions"
        description="Search and filter your complete transaction history."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={FileText} onClick={() => handleExport("pdf")}>Export PDF</Button>
            <Button variant="outline" size="sm" icon={Download} onClick={() => handleExport("csv")}>Export CSV</Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block lg:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search description..." className="w-full rounded-xl border border-rose-100 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Type</span>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-full rounded-xl border border-rose-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]">
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
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Min Amount</span>
            <input type="number" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1); }} placeholder="0" className="w-full rounded-xl border border-rose-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Max Amount</span>
            <input type="number" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }} placeholder="No limit" className="w-full rounded-xl border border-rose-100 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
          </label>
          <div className="flex items-end">
            <Button variant="ghost" size="md" className="w-full" onClick={resetFilters}>Clear Filters</Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card noPadding>
        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Receipt} title="No transactions found" description="Try adjusting your filters or search terms." action={<Button size="sm" onClick={resetFilters}>Clear Filters</Button>} />
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
              ["Transaction ID", selected.id.toUpperCase()],
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
    </div>
  );
}
