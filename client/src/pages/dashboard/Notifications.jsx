import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Landmark, Bell, CheckCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { useBankingData } from "../../hooks/useBankingData";
import { formatCurrency, formatDateTime } from "../../utils/transactions";

const TYPE_META = {
  money_in: { icon: ArrowDownRight, bg: "bg-emerald-50", tone: "text-emerald-600" },
  money_out: { icon: ArrowUpRight, bg: "bg-rose-50", tone: "text-[#800A38]" },
  account_linked: { icon: Landmark, bg: "bg-sky-50", tone: "text-sky-600" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "money_in", label: "Money Received" },
  { id: "money_out", label: "Money Sent" },
  { id: "account_linked", label: "Account Linked" },
];

// Builds real, non-persisted notification items straight from the user's
// actual transactions and linked bank accounts — nothing here is invented.
function buildNotifications(normalizedTransactions, accounts) {
  const fromTransactions = normalizedTransactions.map((t) => ({
    id: `tx_${t.id}`,
    type: t.type === "credit" ? "money_in" : "money_out",
    title: t.type === "credit" ? "Money Received" : "Money Sent",
    message:
      t.type === "credit"
        ? `You received ${formatCurrency(t.amount)} — ${t.desc}`
        : `You sent ${formatCurrency(t.amount)} — ${t.desc}`,
    time: t.date,
  }));

  const fromAccounts = accounts.map((a) => ({
    id: `acc_${a._id}`,
    type: "account_linked",
    title: "Bank Account Linked",
    message: `${a.bankName} (${a.accountNumber || "•••• ••••"}) was linked to your wallet.`,
    time: a.createdAt,
  }));

  return [...fromTransactions, ...fromAccounts].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
}

export default function Notifications() {
  const { normalizedTransactions, accounts, loading } = useBankingData();
  const [filter, setFilter] = useState("all");
  const [readIds, setReadIds] = useState(new Set());

  const notifications = useMemo(
    () => buildNotifications(normalizedTransactions, accounts),
    [normalizedTransactions, accounts]
  );

  const filtered = notifications.filter((n) => filter === "all" || n.type === filter);
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));
  const markRead = (id) => setReadIds((prev) => new Set(prev).add(id));

  return (
    <div>
      <PageHeader
        title="Notifications"
        crumb="Notifications"
        description={loading ? "Loading your activity..." : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        action={<Button variant="secondary" icon={CheckCheck} onClick={markAllRead} disabled={notifications.length === 0}>Mark all as read</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filter === id ? "bg-[#800A38] text-white shadow-md shadow-[#800A38]/20" : "bg-rose-50 text-slate-500 hover:text-[#800A38]"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card noPadding>
        {loading ? (
          <div className="p-5">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="You'll see updates here as soon as money moves in or out, or you link a bank account."
            />
          </div>
        ) : (
          <div className="divide-y divide-rose-50">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              const isUnread = !readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 p-5 cursor-pointer transition-colors ${isUnread ? "bg-rose-50/30" : ""}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{n.title}</p>
                      {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-[#C4185C]" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.message}</p>
                    <p className="mt-1.5 text-[11px] text-slate-400">{formatDateTime(n.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
