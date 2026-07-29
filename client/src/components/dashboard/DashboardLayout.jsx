import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { useToast } from "../ui/Toast";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    toast?.showToast("You have been logged out successfully.", "success");
    // Replace with real session teardown (clear tokens, call /logout API, etc.)
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F8]">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onLogoutClick={() => setLogoutOpen(true)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {/* Mobile-only menu button — the top bar was removed, so this is the
          only way to reach the sidebar on small screens. */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-white text-slate-500 shadow-sm hover:bg-rose-50 hover:text-[#800A38] lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[84px]" : "lg:pl-[260px]"}`}>
        <main className="px-4 pb-6 pt-16 sm:px-6 sm:pb-8 sm:pt-8 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogoutConfirm} />
    </div>
  );
}
