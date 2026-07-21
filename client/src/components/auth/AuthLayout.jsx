import React from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-between p-3 sm:p-5 lg:p-6 font-sans">

      {/* Header with Local Asset Logo & Back Button */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-1 mb-2">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#800A38] bg-white border border-slate-200 hover:border-rose-200 px-3.5 py-2 rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
          title="Go back"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Brand Header with Local Asset Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Atlas Bank Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Atlas <span className="text-[#800A38]">Bank</span>
          </span>
        </Link>
      </header>

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50 p-5 sm:p-7 lg:p-8 my-auto">

        {/* Title Section with reduced bottom margin */}
        <div className="mb-2 sm:mb-3 text-center sm:text-left">
          {eyebrow && (
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#800A38] bg-rose-50 px-3 py-0.5 rounded-full border border-rose-100 inline-block">
              {eyebrow}
            </span>
          )}
          {title && (
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 max-w-md mx-auto sm:mx-0">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Children Content */}
        <div>{children}</div>
      </div>

      {/* Footer */}
      <footer className="py-2 text-[11px] text-slate-400 font-medium text-center">
        © Atlas Bank. All Rights Reserved.
      </footer>
    </div>
  );
}