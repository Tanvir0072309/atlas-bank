const TONES = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  primary: "bg-rose-50 text-[#800A38] border-rose-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status) {
  const s = status?.toLowerCase();
  if (s === "success" || s === "active" || s === "verified") return "success";
  if (s === "pending" || s === "dormant" || s === "unverified") return "pending";
  if (s === "failed" || s === "blocked") return "failed";
  return "neutral";
}
