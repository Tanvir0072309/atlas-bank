import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import api from "../api/axios";
import { ROUTES } from "../utils/constants";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // ✅ Get resetToken from sessionStorage
    const resetToken = sessionStorage.getItem("resetToken");
    if (!resetToken) {
      setError("Session expired. Please start the password reset process again.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Step 3: Reset Password
      await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
        confirmPassword,
      });

      // ✅ Clean up resetToken from sessionStorage
      sessionStorage.removeItem("resetToken");

      // ✅ Redirect to Login Page
      navigate(ROUTES.LOGIN || "/login", {
        state: { message: "Password reset successfully. Please login again." },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Security"
      title="Reset Your Password"
      subtitle="Enter your new password below."
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password@123"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Password@123"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-crimson-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}