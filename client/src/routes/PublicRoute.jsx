import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../components/common/PageLoader.jsx";
import { ROUTES } from "../utils/constants";

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
