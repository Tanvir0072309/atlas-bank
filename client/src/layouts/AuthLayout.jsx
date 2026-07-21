import { Outlet } from "react-router-dom";

// Route-level wrapper for /login, /register, /verify-email, etc.
// The actual split-screen visual design lives in components/auth/AuthLayout.jsx
// and is composed inside each page, so this stays a thin pass-through —
// useful as a hook point for shared route-level logic (analytics, redirects) later.
export default function AuthLayout() {
  return <Outlet />;
}
