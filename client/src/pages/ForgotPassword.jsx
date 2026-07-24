import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      await api.post("/auth/forgot-password", { email });

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full max-w-md mx-auto" noValidate>
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-[#800A38]">
            {error}
          </div>
        )}

        <div className="w-full">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tanvir@gmail.com"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Sending Code..." : "Send Reset Code"}
        </button>

        <p className="text-center text-xs text-slate-500 mt-1">
          Remembered your password?{" "}
          <Link to={ROUTES.LOGIN || "/login"} className="font-extrabold text-[#800A38] hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}