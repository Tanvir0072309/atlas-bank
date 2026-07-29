import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../components/common/PageLoader.jsx";
import { ROUTES } from "../utils/constants";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  // Verify Email page aur password reset flow ko redirect mat karo
  // (logged-in users can still reach these — e.g. "Reset Password" from Profile)
  const alwaysAccessible = ["/verify-email", "/forgot-password", "/verify-reset-code", "/reset-password"];
  if (
    isAuthenticated &&
    !alwaysAccessible.some((path) => location.pathname.startsWith(path))
  ) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}