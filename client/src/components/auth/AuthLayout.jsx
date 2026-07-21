import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { BANK_NAME, ROUTES } from "../../utils/constants";

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#FAF7F8] flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-[#800A38] selection:text-white">
      {/* Header */}
      <header className="border-b border-rose-100 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to={ROUTES.HOME || "/"} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#800A38] to-[#C4185C] p-1.5 shadow-md shadow-[#800A38]/20">
              <img src={logo} alt={BANK_NAME} className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#800A38]">
              {BANK_NAME.toUpperCase()}
            </span>
          </Link>
          <Link
            to={ROUTES.HOME || "/"}
            className="text-xs font-bold text-[#800A38] hover:text-[#A30E4A] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-xl shadow-rose-900/5">
          {eyebrow && (
            <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#800A38] border border-rose-200 mb-3">
              {eyebrow}
            </span>
          )}
          {title && <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>}
          {subtitle && <p className="mt-2 text-xs text-slate-600 leading-relaxed">{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {BANK_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}