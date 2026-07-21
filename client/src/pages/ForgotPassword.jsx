import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { authService } from "../services/auth.service";
import { isValidEmail } from "../utils/validators";
import { ROUTES } from "../utils/constants";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      navigate(ROUTES.RESET_PASSWORD, { state: { email } });
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't find an account with that email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Reset Your Password"
      subtitle="Enter your registered email address to receive a verification code."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <p className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-[#800A38]">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-[#800A38] focus:outline-none focus:ring-1 focus:ring-[#800A38]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#A30E4A] transition-all disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>

        <p className="text-center text-xs text-slate-500 mt-2">
          Remembered it?{" "}
          <Link to={ROUTES.LOGIN} className="font-bold text-[#800A38] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}