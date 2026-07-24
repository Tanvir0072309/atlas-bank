export default function Card({ children, className = "", noPadding = false }) {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-rose-100 bg-white shadow-sm shadow-rose-900/[0.03] ${
        noPadding ? "" : "p-4 sm:p-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}
