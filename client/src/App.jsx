import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // AuthProvider ko import karein
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { ROUTES } from "./utils/constants";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.HOME || "/"} element={<Welcome />} />
          <Route path={ROUTES.LOGIN || "/login"} element={<Login />} />
          <Route path={ROUTES.REGISTER || "/register"} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD || "/forgot-password"} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD || "/reset-password"} element={<ResetPassword />} />
          <Route path={ROUTES.VERIFY_EMAIL || "/verify-email"} element={<VerifyEmail />} />
          <Route path={ROUTES.DASHBOARD || "/dashboard"} element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}