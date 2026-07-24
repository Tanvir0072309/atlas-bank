// EXAMPLE — merge this routing structure into your existing App.jsx / router file.
// Only the dashboard routes are new; keep your existing Welcome, Login, Register routes as-is.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";

import Welcome from "./pages/Welcome"; // your existing landing page
// import Login from "./pages/Login";
// import Register from "./pages/Register";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import MyAccounts from "./pages/dashboard/MyAccounts";
import TransferMoney from "./pages/dashboard/TransferMoney";
import Beneficiaries from "./pages/dashboard/Beneficiaries";
import Transactions from "./pages/dashboard/Transactions";
import Analytics from "./pages/dashboard/Analytics";
import Notifications from "./pages/dashboard/Notifications";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/register" element={<Register />} /> */}

          {/* Dashboard — sidebar + topbar wrap every nested page automatically */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="accounts" element={<MyAccounts />} />
            <Route path="transfer" element={<TransferMoney />} />
            <Route path="beneficiaries" element={<Beneficiaries />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
