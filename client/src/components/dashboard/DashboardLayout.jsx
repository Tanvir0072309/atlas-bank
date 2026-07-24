import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
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

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[84px]" : "lg:pl-[260px]"}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} onLogoutClick={() => setLogoutOpen(true)} />

        <main className="px-4 py-6 sm:px-6 sm:py-8 max-w-[1400px] mx-auto">
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
