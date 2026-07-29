import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AuthRouteLayout from "../layouts/AuthLayout.jsx";

import Welcome from "../pages/Welcome.jsx";
import Register from "../pages/Register.jsx";
import Login from "../pages/Login.jsx";
import VerifyEmail from "../pages/VerifyEmail.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import VerifyResetCode from "../pages/VerifyResetCode.jsx";
import NotFound from "../pages/NotFound.jsx";

// Dashboard shell + pages
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Wallet from "../pages/dashboard/Wallet.jsx";
import Transactions from "../pages/dashboard/Transactions.jsx";
import Cards from "../pages/dashboard/Cards.jsx";
import AIAssistant from "../pages/dashboard/AIAssistant.jsx";
import Analytics from "../pages/dashboard/Analytics.jsx";
import Notifications from "../pages/dashboard/Notifications.jsx";
import Profile from "../pages/dashboard/Profile.jsx";
import HelpCenter from "../pages/dashboard/HelpCenter.jsx";

import { ROUTES } from "../utils/constants";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public-only routes (redirect away if already logged in) */}
      <Route element={<PublicRoute />}>
        {/* Landing page — no forms here, just Log in / Open an account */}
        <Route path={ROUTES.HOME} element={<Welcome />} />

        <Route element={<AuthRouteLayout />}>
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.VERIFY_RESET_CODE} element={<VerifyResetCode />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
        </Route>
      </Route>

      {/* Protected routes (require a logged-in session) */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard shell — sidebar + topbar wrap every nested page below */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="cards" element={<Cards />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
    </Routes>
  );
}
