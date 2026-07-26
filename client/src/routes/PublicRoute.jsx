import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../components/common/PageLoader.jsx";
import { ROUTES } from "../utils/constants";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  // Verify Email page ko redirect mat karo
  if (
    isAuthenticated &&
    !location.pathname.startsWith("/verify-email")
  ) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}