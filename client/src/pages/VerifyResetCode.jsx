import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import api from "../api/axios";
import { ROUTES } from "../utils/constants";

export default function VerifyResetCode() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || "");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // ✅ Step 2: Verify OTP
            const { data } = await api.post("/auth/verify-reset-code", { email, code });

            // ✅ Save resetToken in sessionStorage as per docs
            if (data?.resetToken) {
                sessionStorage.setItem("resetToken", data.resetToken);
            }

            // Navigate to Reset Password Page
            navigate(ROUTES.RESET_PASSWORD || "/reset-password");
        } catch (err) {
            setError(
                err?.response?.data?.message || "Invalid or expired verification code."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="Verification"
            title="Enter Reset Code"
            subtitle={`We've sent a 6-digit code to ${email || "your email"}`}
        >
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!location.state?.email && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">OTP Code</label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-center tracking-widest text-lg"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-crimson-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>
            </form>
        </AuthLayout>
    );
}