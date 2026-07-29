import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { CUSTOMER, NOTIFICATIONS } from "../../data/mockData";

export default function Topbar({ onMenuClick, onLogoutClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = CUSTOMER.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-rose-100 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-[#800A38] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search transactions, beneficiaries..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#800A38] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-rose-50 hover:text-[#800A38] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C4185C] text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[85vw] rounded-2xl border border-rose-100 bg-white shadow-xl overflow-hidden">
              <div className="border-b border-rose-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] font-semibold text-[#800A38]">{unreadCount} unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.slice(0, 5).map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-rose-50 last:border-0 ${!n.read ? "bg-rose-50/40" : ""}`}>
                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setNotifOpen(false);
                  navigate("/dashboard/notifications");
                }}
                className="block w-full py-2.5 text-center text-xs font-bold text-[#800A38] hover:bg-rose-50"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 hover:bg-rose-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#800A38] to-[#C4185C] text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">{CUSTOMER.name.split(" ")[0]}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-rose-100 bg-white shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-rose-100">
                <p className="text-sm font-bold text-slate-900 truncate">{CUSTOMER.name}</p>
                <p className="text-xs text-slate-500 truncate">{CUSTOMER.email}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate("/dashboard/profile"); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-[#800A38]"
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              <button
                onClick={() => { setProfileOpen(false); onLogoutClick(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 border-t border-rose-100"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
