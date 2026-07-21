import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import api from "../api/axios";
import { STORAGE_KEYS, ROUTES } from "../utils/constants";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const hasVerified = useRef(false);

  const [status, setStatus] = useState("verifying");
  const [errorMessage, setServerError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setServerError("Verification token is missing or invalid.");
      return;
    }

    // Prevent duplicate API calls in React Strict Mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      try {
        const { data } = await api.get(
          `/v1/auth/verify-email?token=${token}`
        );

        if (data?.token) {
          localStorage.setItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            data.token
          );
        }

        if (data?.user) {
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(data.user)
          );
        }

        setStatus("success");

        setTimeout(() => {
          navigate(ROUTES.DASHBOARD || "/dashboard", {
            replace: true,
          });
        }, 1500);
      } catch (err) {
        setStatus("error");
        setServerError(
          err?.response?.data?.message ||
          "Invalid or expired verification link."
        );
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <AuthLayout
      eyebrow="Account Security"
      title="Email Verification"
      subtitle="Securing your Atlas Bank account."
    >
      <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-[#800A38]/20 border-t-[#800A38] rounded-full animate-spin"></div>

            <p className="text-sm font-semibold text-slate-700">
              Verifying your email...
            </p>

            <p className="text-xs text-slate-400">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Email Verified Successfully
            </h2>

            <p className="text-sm text-slate-500">
              Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Verification Failed
            </h2>

            <p className="text-sm text-red-600">
              {errorMessage}
            </p>

            <button
              onClick={() =>
                navigate(ROUTES.LOGIN || "/login")
              }
              className="mt-4 px-6 py-2 rounded-full bg-[#800A38] text-white hover:bg-[#A30E4A]"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}