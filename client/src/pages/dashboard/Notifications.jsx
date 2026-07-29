import { useState } from "react";
import { ShieldAlert, Send, Settings2, Bell, Trash2, CheckCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { NOTIFICATIONS as INITIAL, formatDateTime } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

const TYPE_META = {
  security: { icon: ShieldAlert, bg: "bg-red-50", tone: "text-red-600" },
  transfer: { icon: Send, bg: "bg-emerald-50", tone: "text-emerald-600" },
  system: { icon: Settings2, bg: "bg-sky-50", tone: "text-sky-600" },
};

const FILTERS = ["all", "unread", "security", "transfer", "system"];

export default function Notifications() {
  const [list, setList] = useState(INITIAL);
  const [filter, setFilter] = useState("all");
  const toast = useToast();

  const filtered = list.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markAllRead = () => {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    toast?.showToast("All notifications marked as read", "success");
  };

  const markRead = (id) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const remove = (id) => {
    setList((l) => l.filter((n) => n.id !== id));
    toast?.showToast("Notification deleted", "success");
  };

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        crumb="Notifications"
        description={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        action={<Button variant="secondary" icon={CheckCheck} onClick={markAllRead}>Mark all as read</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all ${
              filter === f ? "bg-[#800A38] text-white shadow-md shadow-[#800A38]/20" : "bg-rose-50 text-slate-500 hover:text-[#800A38]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card noPadding>
        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Bell} title="You're all caught up" description="No notifications match this filter right now." />
          </div>
        ) : (
          <div className="divide-y divide-rose-50">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div key={n.id} className={`flex items-start gap-4 p-5 ${!n.read ? "bg-rose-50/30" : ""}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1" onClick={() => markRead(n.id)}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#C4185C]" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.message}</p>
                    <p className="mt-1.5 text-[11px] text-slate-400">{formatDateTime(n.time)}</p>
                  </div>
                  <button onClick={() => remove(n.id)} className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
