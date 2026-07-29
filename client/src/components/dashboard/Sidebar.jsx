import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet as WalletIcon,
  Receipt,
  CreditCard,
  Sparkles,
  BarChart3,
  Bell,
  User,
  LifeBuoy,
  LogOut,
  X,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { BANK_NAME } from "../../utils/constants";
import logo from "../../assets/logo.png";

// Grouped so the sidebar reads as sections instead of one long flat list.
const MENU_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" }],
  },
  {
    label: "Banking",
    items: [
      { label: "Wallet", icon: WalletIcon, to: "/dashboard/wallet" },
      { label: "Transactions", icon: Receipt, to: "/dashboard/transactions" },
      { label: "Cards", icon: CreditCard, to: "/dashboard/cards", tag: "Future" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "AI Financial Assistant", icon: Sparkles, to: "/dashboard/ai-assistant" },
      { label: "Analytics", icon: BarChart3, to: "/dashboard/analytics" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "My Profile", icon: User, to: "/dashboard/profile" },
      { label: "Notifications", icon: Bell, to: "/dashboard/notifications" },
      { label: "Help Center", icon: LifeBuoy, to: "/dashboard/help" },
    ],
  },
];

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavItem({ label, icon: Icon, to, badge, tag, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
          collapsed ? "justify-center px-0" : ""
        } ${
          isActive
            ? "bg-[#800A38] text-white shadow-md shadow-[#800A38]/20"
            : "text-slate-600 hover:bg-rose-50 hover:text-[#800A38]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative shrink-0">
            <Icon className={`h-[18px] w-[18px] ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#800A38]"}`} />
            {collapsed && badge > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C4185C] px-1 text-[9px] font-bold text-white">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </span>
          {!collapsed && <span className="truncate">{label}</span>}
          {!collapsed && tag && (
            <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
              {tag}
            </span>
          )}
          {!collapsed && badge > 0 && (
            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C4185C]/15 px-1.5 text-[10px] font-bold text-[#C4185C]">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
          {!collapsed && isActive && (
            <motion.span
              layoutId="sidebar-active-dot"
              className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate, collapsed, onToggleCollapse, showCollapseToggle }) {
  const { user } = useAuth();
  const displayName = user?.fullName || "You";
  const verified = Boolean(user?.isEmailVerified);

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-6 py-6 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white overflow-hidden">
          <img src={logo} alt={BANK_NAME} className="h-7 w-7 object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-[#800A38]">{BANK_NAME} Bank</span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Customer Portal</span>
          </div>
        )}
      </div>

      {/* Menu — grouped into sections */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5">
        {MENU_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {showCollapseToggle && (
        <button
          onClick={onToggleCollapse}
          className={`mx-3 mb-2 flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-[#800A38] transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              Collapse
            </>
          )}
        </button>
      )}

      {/* Profile mini-card */}
      <div className={`mx-3 mb-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3 ${collapsed ? "flex justify-center" : ""}`}>
        <NavLink
          to="/dashboard/profile"
          onClick={onNavigate}
          title={collapsed ? displayName : undefined}
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#800A38] to-[#C4185C] text-xs font-bold text-white">
            {initials(displayName)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-700">{displayName}</p>
              <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                <ShieldCheck className={`h-3 w-3 ${verified ? "text-emerald-500" : "text-amber-500"}`} />
                {verified ? "Verification complete" : "Verification pending"}
              </p>
            </div>
          )}
        </NavLink>
      </div>

      {/* Logout Route */}
      <div className={`px-3 pb-6 pt-2 border-t border-rose-100 ${collapsed ? "flex justify-center" : ""}`}>
        <NavLink
          to="/logout"
          onClick={onNavigate}
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors ${
            collapsed ? "justify-center px-0" : "w-full"
          }`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 text-slate-400" />
          {!collapsed && "Logout"}
        </NavLink>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose, collapsed = false, onToggleCollapse }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-rose-100 bg-white transition-[width] duration-200 ${
          collapsed ? "w-[84px]" : "w-[260px]"
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          showCollapseToggle
        />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[80%] max-w-[300px] bg-white shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <button
                onClick={onMobileClose}
                className="absolute right-4 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={onMobileClose} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
