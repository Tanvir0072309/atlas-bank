import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

    const resetToken = sessionStorage.getItem("resetToken");
    if (!resetToken) {
      setError("Session expired. Please start the password reset process again.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
        confirmPassword,
      });

      sessionStorage.removeItem("resetToken");

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
      subtitle="Enter your new password below to secure your account."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full max-w-md mx-auto" noValidate>
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-[#800A38]">
            {error}
          </div>
        )}

        <div className="w-full">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password@123"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10 text-slate-800"
          />
        </div>

        <div className="w-full">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Password@123"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>

        <p className="text-center text-xs text-slate-500 mt-1">
          Back to{" "}
          <Link to={ROUTES.LOGIN || "/login"} className="font-extrabold text-[#800A38] hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}