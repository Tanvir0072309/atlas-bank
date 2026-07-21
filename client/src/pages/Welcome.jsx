import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import handImg from "../assets/hand.png";
import { BANK_NAME, BANK_TAGLINE, ROUTES } from "../utils/constants";

// Crimson Palette: Primary (#800A38), Dark Maroon (#5C0526), Highlight Rose (#C4185C)

const connectedBanks = [
  { id: 1, name: "HDFC Bank Account", type: "Savings Account", balance: "₹1,45,200", badge: "Primary", logoText: "HDFC" },
  { id: 2, name: "State Bank of India", type: "Savings Account", balance: "₹82,450", badge: "Active", logoText: "SBI" },
  { id: 3, name: "ICICI Sapphiro Credit Card", type: "Credit Limit: ₹3,00,000", balance: "₹18,300 Due", badge: "Due Soon", logoText: "ICICI" },
  { id: 4, name: "Axis Bank Account", type: "Current Account", balance: "₹45,900", badge: "Active", logoText: "AXIS" },
];

const features = [
  {
    title: "Unified Multi-Bank Balance",
    body: "Fetch live balances across all your connected Indian bank accounts simultaneously in one unified dashboard.",
    tag: "OPEN BANKING",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: "Instant Inter-Bank Router",
    body: "Transfer funds between your linked accounts seamlessly using Account Aggregator protocols.",
    tag: "ZERO DELAY",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: "Credit Card Bill Engine",
    body: "Consolidate all credit card statements, view due dates, and manage bills directly from one portal.",
    tag: "CARDS HUB",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Consolidated Expense Insights",
    body: "Auto-categorize transactions across all debit and credit cards into clean spending visualizers.",
    tag: "ANALYTICS",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      </svg>
    ),
  },
  {
    title: "Bank-Grade Encryption",
    body: "Multi-factor authentication and 256-bit SSL vault protection for ultimate financial privacy.",
    tag: "SECURITY",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Integrated Liquidity Control",
    body: "Compare interest rates across connected accounts and monitor fixed deposits without switching apps.",
    tag: "WEALTH",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: "How does this app connect all my bank accounts?",
    a: "We utilize the RBI-regulated Account Aggregator (AA) framework. Once you authenticate using your mobile number and OTP, your accounts are encrypted and linked securely.",
  },
  {
    q: "Can I directly transfer money between my linked bank accounts?",
    a: "Yes! You can transfer funds from your SBI account to your HDFC or ICICI account in a single click using our 1-Click UPI/IMPS router.",
  },
  {
    q: "How safe is my debit and credit card information?",
    a: "Your Net Banking passwords and card CVV numbers are never saved on our servers. Multi-factor authentication ensures 100% security for all data.",
  },
  {
    q: "Are there any charges for checking my bank balance?",
    a: "No, fetching live balance updates across all your connected accounts is completely free.",
  },
];

export default function Welcome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#FAF7F8] text-slate-800 font-sans antialiased selection:bg-[#800A38] selection:text-white overflow-x-hidden">

      {/* 3D Card Flip CSS Classes */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Top Banner Notice */}
      <div className="bg-[#800A38] px-4 py-2 text-center text-xs font-medium text-rose-100 flex items-center justify-center gap-2">
        <span className="rounded-full bg-[#A30E4A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-rose-300/20 shrink-0">
          SUPER-APP HUB
        </span>
        <span className="truncate">Connect all your Indian Bank Accounts & Credit Cards in one unified portal.</span>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#800A38] to-[#C4185C] p-1.5 shadow-md shadow-[#800A38]/20">
              <img src={logo} alt={BANK_NAME} className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#800A38] leading-none">
                {BANK_NAME.toUpperCase()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Multi-Bank Cockpit</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#home" className="hover:text-[#800A38] transition-colors">Home</a>
            <a href="#dashboard" className="hover:text-[#800A38] transition-colors">Aggregator</a>
            <a href="#features" className="hover:text-[#800A38] transition-colors">Features</a>
            <a href="#faqs" className="hover:text-[#800A38] transition-colors">FAQs</a>
            <a href="#contact" className="hover:text-[#800A38] transition-colors">Contact Us</a>
            <a href="#policy" className="hover:text-[#800A38] transition-colors">Policy</a>
          </nav>

          {/* Action CTAs: Sign In & Register */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="px-4 py-2 text-sm font-bold text-[#800A38] hover:text-[#A30E4A] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full bg-gradient-to-r from-[#800A38] to-[#A30E4A] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#800A38]/20 hover:from-[#A30E4A] hover:to-[#C4185C] transition-all transform hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-rose-50 border border-slate-200 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Slide Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-rose-100 bg-white px-6 pt-4 pb-6 shadow-xl space-y-4">
            <nav className="flex flex-col space-y-3 font-semibold text-slate-700 text-sm">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#800A38]">Home</a>
              <a href="#dashboard" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#800A38]">Aggregator Dashboard</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#800A38]">Features</a>
              <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#800A38]">FAQs</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#800A38]">Contact Us</a>
              <a href="#policy" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#800A38]">Privacy Policy</a>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-[#800A38] border border-rose-200 rounded-xl bg-rose-50"
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#800A38] rounded-xl shadow-md"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-bold text-[#800A38] mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#800A38] animate-ping" />
              All-In-One Open Banking Ecosystem
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {BANK_TAGLINE}
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              No need to switch between multiple banking apps! Link your HDFC, SBI, ICICI, Axis bank accounts and credit cards in one place. Enjoy unified balance checks and seamless card statement tracking.
            </p>

            {/* Allowed Hero CTAs: Register & Sign In */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5">
              <Link
                to={ROUTES.REGISTER}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#800A38] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#800A38]/25 hover:bg-[#A30E4A] transition-all transform hover:-translate-y-0.5"
              >
                Register Account
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="mt-12 border-t border-rose-100 pt-8 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#800A38]">25+ Banks</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">RBI Connected</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#800A38]">1 Portal</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Consolidated Control</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#800A38]">256-Bit</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">SSL Safe</p>
              </div>
            </div>
          </div>

          {/* Hero Right: 3D Animated Flipping Debit Card */}
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-md bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-2xl shadow-rose-900/10">

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Interactive Platinum Card</span>
                <span className="text-[11px] font-semibold text-slate-400">Click card to flip</span>
              </div>

              {/* 3D FLIP CONTAINER */}
              <div
                className="perspective-1000 w-full cursor-pointer"
                onClick={() => setCardFlipped(!cardFlipped)}
              >
                <div
                  className={`relative aspect-[1.586/1] w-full rounded-2xl transition-transform duration-700 transform-style-3d ${cardFlipped ? "rotate-y-180" : ""
                    }`}
                >
                  {/* CARD FRONT SIDE */}
                  <div className="absolute inset-0 h-full w-full rounded-2xl p-5 text-white shadow-xl shadow-[#800A38]/30 bg-gradient-to-br from-[#800A38] via-[#5C0526] to-[#C4185C] flex flex-col justify-between overflow-hidden border border-rose-300/30 backface-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />
                    <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={logo} alt={BANK_NAME} className="h-6 w-6 object-contain brightness-0 invert" />
                          <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
                            {BANK_NAME}
                          </span>
                        </div>
                        <svg className="h-6 w-6 text-rose-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 010-7.778M12.354 19.192a9.5 9.5 0 000-13.384M16.596 21.98a13.5 13.5 0 000-18.96" />
                        </svg>
                      </div>

                      <div className="flex items-center justify-between my-2">
                        <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-100 border border-amber-500/50 shadow-inner flex flex-col justify-between p-1">
                          <div className="h-0.5 w-full bg-amber-600/30" />
                          <div className="h-0.5 w-full bg-amber-600/30" />
                          <div className="h-0.5 w-full bg-amber-600/30" />
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-rose-200 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                          DEBIT / PLATINUM
                        </span>
                      </div>

                      <div>
                        <p className="font-mono text-base sm:text-lg tracking-widest text-white font-semibold drop-shadow-sm">
                          4920 8812 3900 7412
                        </p>
                      </div>

                      <div className="flex items-end justify-between pt-1">
                        <div>
                          <p className="text-[8px] font-bold text-rose-200 uppercase tracking-widest">Cardholder Name</p>
                          <p className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase font-mono">TANVIR KHAN</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-bold text-rose-200 uppercase tracking-widest">Valid Thru</p>
                          <p className="text-xs font-bold text-white font-mono">11/29</p>
                        </div>
                        <div className="font-bold tracking-widest italic text-lg sm:text-xl text-white/90">
                          VISA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD BACK SIDE */}
                  <div className="absolute inset-0 h-full w-full rounded-2xl p-5 text-white shadow-xl shadow-[#800A38]/30 bg-gradient-to-br from-[#5C0526] to-[#800A38] flex flex-col justify-between overflow-hidden border border-rose-300/30 backface-hidden rotate-y-180">
                    <div className="h-9 bg-slate-900 -mx-5 -mt-1 shadow-inner" />
                    <div className="my-2">
                      <p className="text-[8px] text-rose-200 uppercase tracking-widest mb-1">Authorized Signature</p>
                      <div className="h-8 bg-white/90 rounded px-3 flex items-center justify-between text-slate-800">
                        <span className="font-serif italic text-xs font-bold text-slate-600">TANVIR KHAN</span>
                        <span className="font-mono text-xs font-bold tracking-widest">CVV: 894</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-rose-200 leading-tight">
                      This card is property of {BANK_NAME}. Subject to Account Aggregator guidelines.
                    </div>
                  </div>

                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={handImg} alt="" className="h-8 w-8 object-contain shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Virtual Card Shield</p>
                    <p className="text-[10px] text-slate-500">256-Bit Encrypted Link</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  ACTIVE
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Aggregator Dashboard Section */}
      <section id="dashboard" className="bg-white py-16 sm:py-20 border-y border-rose-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#800A38] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Live Overview
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900">
              Consolidated Multi-Bank Cockpit
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              View all your bank accounts and credit card balances in a single, secure dashboard:
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">

            {/* Bank Accounts List */}
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Connected Accounts ({connectedBanks.length})</p>
              {connectedBanks.map((bank, idx) => (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBankIdx(idx)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedBankIdx === idx
                      ? "bg-rose-50/70 border-[#800A38] shadow-md ring-1 ring-[#800A38]/30"
                      : "bg-white border-slate-200 hover:border-rose-200"
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#800A38] text-white font-extrabold text-xs shadow-sm">
                      {bank.logoText}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{bank.name}</h4>
                      <p className="text-[11px] text-slate-500">{bank.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#800A38]">{bank.balance}</p>
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {bank.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Bank Summary Box */}
            <div className="lg:col-span-5 bg-[#FAF7F8] p-6 rounded-3xl border border-rose-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{connectedBanks[selectedBankIdx].name}</h3>
              <p className="text-2xl font-extrabold text-[#800A38] my-3">{connectedBanks[selectedBankIdx].balance}</p>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Manage transactions and monitor credit card statement due dates directly via register/login access.
              </p>

              <div className="space-y-2.5">
                <Link
                  to={ROUTES.REGISTER}
                  className="block w-full text-center rounded-xl bg-[#800A38] py-3 text-xs font-bold text-white shadow-md hover:bg-[#A30E4A] transition-all"
                >
                  Register To Access Full Features
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#800A38] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Super Features
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900">
            Built For Multi-Account Holders
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 transition-all duration-300 hover:border-[#800A38] hover:shadow-xl hover:shadow-rose-900/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#800A38] border border-rose-200 group-hover:bg-[#800A38] group-hover:text-white transition-colors">
                  {f.icon}
                </div>
                <span className="text-[10px] font-bold tracking-widest text-[#800A38] uppercase bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 group-hover:text-[#800A38] transition-colors">
                {f.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="bg-white py-20 border-t border-rose-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 text-sm hover:text-[#800A38] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-bold text-[#800A38] ml-4">
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Section */}
      <section id="policy" className="bg-slate-50 py-16 border-t border-rose-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-6">Privacy Policy & Security Standards</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
            We prioritize your financial privacy and cybersecurity above everything else. Our platform operates strictly under the RBI Account Aggregator framework. Your Net Banking passwords and card CVV numbers are never saved on our servers. All data transfers are safeguarded with 256-bit SSL encryption.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-16 border-t border-rose-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Contact Us</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">Have queries regarding bank account aggregation? Reach out to us 24x7.</p>
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs font-bold text-[#800A38]">
            <span>Email: support@{BANK_NAME.toLowerCase().replace(/\s+/g, '')}.com</span>
            <span className="hidden sm:inline">•</span>
            <span>Toll Free: 1800-123-CRIMSON</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#800A38] via-[#5C0526] to-[#C4185C] px-6 py-12 text-center text-white sm:px-12 sm:text-left shadow-2xl shadow-[#800A38]/20">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready to bring all your bank accounts together?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-rose-100">
                Register now and link your accounts digitally in under 2 minutes.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                to={ROUTES.REGISTER}
                className="flex-1 sm:flex-none shrink-0 rounded-full bg-white px-8 py-3.5 text-xs sm:text-sm font-extrabold text-[#800A38] shadow-lg transition-all hover:bg-rose-50 text-center"
              >
                Register
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="flex-1 sm:flex-none shrink-0 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-xs sm:text-sm font-extrabold text-white transition-all hover:bg-white/20 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white py-8 text-slate-500 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src={logo} alt={BANK_NAME} className="h-5 w-5 object-contain" />
            <span className="font-extrabold text-slate-900 text-sm">{BANK_NAME}</span>
          </div>
          <p>© {new Date().getFullYear()} {BANK_NAME}. All rights reserved. Powered by RBI Account Aggregator Framework.</p>
        </div>
      </footer>

    </div>
  );
}