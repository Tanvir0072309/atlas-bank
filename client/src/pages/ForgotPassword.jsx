import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import api from "../api/axios";
import { ROUTES } from "../utils/constants";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Exact API as per doc (/api/auth/forgot-password)
      await api.post("/auth/forgot-password", { email });

      // Navigate to Verify Reset Code page with email state
      navigate(ROUTES.VERIFY_RESET_CODE || "/verify-reset-code", {
        state: { email },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to send reset code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Forgot Password?"
      subtitle="Enter your registered email address to receive an OTP code."
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tanvir@gmail.com"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-crimson-600 hover:from-red-500 hover:to-crimson-500 text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Sending Code..." : "Send Reset Code"}
        </button>
      </form>
    </AuthLayout>
  );
}