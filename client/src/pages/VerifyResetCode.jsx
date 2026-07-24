import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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
            const { data } = await api.post("/auth/verify-reset-code", { email, code });

            if (data?.resetToken) {
                sessionStorage.setItem("resetToken", data.resetToken);
            }

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
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full max-w-md mx-auto" noValidate>
                {error && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-[#800A38]">
                        {error}
                    </div>
                )}

                {!location.state?.email && (
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
                )}

                <div className="w-full">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        OTP Code
                    </label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-center text-base tracking-widest font-bold transition-all outline-none bg-slate-50/50 focus:bg-white focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10 text-slate-800"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-60 cursor-pointer"
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>

                <p className="text-center text-xs text-slate-500 mt-1">
                    Didn't receive code?{" "}
                    <Link to={ROUTES.FORGOT_PASSWORD || "/forgot-password"} className="font-extrabold text-[#800A38] hover:underline">
                        Resend
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}