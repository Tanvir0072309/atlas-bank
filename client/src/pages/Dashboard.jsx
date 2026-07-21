import { useAuth } from "../hooks/useAuth";
import { formatCurrency, formatDate, maskAccountNumber } from "../utils/helpers";
import logo from "../assets/logo.png";
import { BANK_NAME } from "../utils/constants";

const quickActions = [
  { label: "Send money", icon: <path d="M4 12h16m0 0-6-6m6 6-6 6" /> },
  { label: "Add funds", icon: <path d="M12 4v16m8-8H4" /> },
  { label: "Pay a bill", icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  { label: "Manage cards", icon: <path d="M3 8h18M3 6h18v12H3V6Zm3 8h4" /> },
];

const transactions = [
  { id: 1, name: "Salary credit", date: "2026-07-01", amount: 82000, type: "credit" },
  { id: 2, name: "Electricity bill", date: "2026-07-05", amount: -2140, type: "debit" },
  { id: 3, name: "Transfer to Aditi Rao", date: "2026-07-11", amount: -5000, type: "debit" },
  { id: 4, name: "Grocery — BigBasket", date: "2026-07-14", amount: -1875, type: "debit" },
  { id: 5, name: "Interest credit", date: "2026-07-17", amount: 312, type: "credit" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const balance = 96420.5;

  return (
    <div className="min-h-screen bg-[#FAF7F8] text-slate-800 font-sans antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-rose-100 shadow-sm px-4 sm:px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#800A38] p-1.5">
              <img src={logo} alt={BANK_NAME} className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <span className="font-extrabold text-lg text-[#800A38] uppercase tracking-tight">{BANK_NAME}</span>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {user?.fullName || "Tanvir Khan"}
          </span>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 flex flex-col gap-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#800A38]">Welcome Back</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {user?.fullName ? user.fullName.split(" ")[0] : "Tanvir"}, here's your account today.
          </h1>
        </div>

        {/* Primary Account Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800A38] via-[#5C0526] to-[#C4185C] p-6 sm:p-8 text-white shadow-xl shadow-[#800A38]/20 border border-rose-300/30">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-200">
                Primary Savings Account
              </p>
              <p className="mt-3 text-3xl sm:text-4xl font-extrabold">{formatCurrency(balance)}</p>
              <p className="mt-2 text-xs font-mono text-rose-100">
                {maskAccountNumber(user?.accountNumber || "0000000004821")}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-mono font-bold text-white border border-white/20">
              IFSC: VTLN0001234
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-xs font-bold text-slate-800 transition-all hover:border-[#800A38] hover:bg-rose-50/50 shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-[#800A38]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  {action.icon}
                </svg>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Recent Transactions
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between px-5 py-4 ${index !== transactions.length - 1 ? "border-b border-slate-100" : ""
                  }`}
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{tx.name}</p>
                  <p className="text-[10px] text-slate-500">{formatDate(tx.date)}</p>
                </div>
                <span
                  className={`text-xs sm:text-sm font-extrabold ${tx.type === "credit" ? "text-emerald-600" : "text-slate-900"
                    }`}
                >
                  {tx.type === "credit" ? "+" : "−"}
                  {formatCurrency(Math.abs(tx.amount)).replace("-", "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}