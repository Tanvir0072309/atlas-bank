import Spinner from "./Spinner.jsx";

export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-brand-500">
      <Spinner size={22} />
      <span className="text-sm font-medium text-muted">{label}</span>
    </div>
  );
}
