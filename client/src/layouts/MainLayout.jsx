import { Link, NavLink, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { getInitials } from "../utils/helpers";
import { BANK_NAME, ROUTES } from "../utils/constants";

const navItems = [
  { label: "Overview", to: ROUTES.DASHBOARD },
  { label: "Accounts", to: "#" },
  { label: "Cards", to: "#" },
  { label: "Support", to: "#" },
];

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3">
            <img src={logo} alt={BANK_NAME} className="h-8 w-8" />
            <span className="font-display text-lg text-brand-600">{BANK_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-brand-600" : "text-muted hover:text-brand-500"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              {getInitials(user?.fullName || "You")}
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-brand-200 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
