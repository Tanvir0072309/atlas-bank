import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Input from "../common/Input.jsx";
import PasswordInput from "./PasswordInput.jsx";
import Button from "../common/Button.jsx";
import { useAuth } from "../../hooks/useAuth";
import { validateLoginForm } from "../../utils/validators";
import { ROUTES } from "../../utils/constants";

export default function LoginForm() {
  const { login, verifyLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form States
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  // Security States (Attempts & 30-min Lockout)
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockUntil, setLockUntil] = useState(null);
  const [timer, setTimer] = useState("");

  // 30 Minutes Live Reverse Countdown Effect
  useEffect(() => {
    if (!lockUntil) return;

    const interval = setInterval(() => {
      const diff = new Date(lockUntil).getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(interval);
        setLockUntil(null);
        setTimer("");
        setAttemptsLeft(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimer(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [lockUntil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError("");
  };

  const handleOtpChange = (e) => {
    const cleanOtp = e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 6);
    setOtp(cleanOtp);
    if (serverError) setServerError("");
  };

  // STEP 1: Log in Click -> Credentials Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateLoginForm ? validateLoginForm(form) : {};
    if (!form.email) validationErrors.email = "Email is required";
    if (!form.password) validationErrors.password = "Password is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await login(form);

      // Step 1 Success -> Open OTP Box on same page
      setShowOTP(true);
      if (data?.remainingAttempts !== undefined) {
        setAttemptsLeft(data.remainingAttempts);
      }
    } catch (err) {
      const data = err.response?.data;

      // Update remaining attempts and lock status
      if (data?.remainingAttempts !== undefined) {
        setAttemptsLeft(data.remainingAttempts);
      }

      if (data?.lockUntil) {
        setLockUntil(data.lockUntil);
      }

      // Show lock or invalid error message directly on this page
      setServerError(data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify & Login Click -> Check OTP with DB Code
  const handleVerifyLogin = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      setServerError("Please enter 6-character verification code.");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await verifyLogin(form.email, otp);

      // Correct Code -> Navigate to Dashboard
      const redirectPath = location.state?.from?.pathname || ROUTES.DASHBOARD || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const data = err.response?.data;

      if (data?.remainingAttempts !== undefined) {
        setAttemptsLeft(data.remainingAttempts);
      }

      if (data?.lockUntil) {
        setLockUntil(data.lockUntil);
      }

      setServerError(data?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full">
      {/* 3D Visual Cards */}
      <div className="flex w-full items-center justify-center order-first lg:order-last py-1 lg:py-0">
        <img
          src="https://cdn3d.iconscout.com/3d/premium/thumb/credit-cards-3d-icon-png-download-4655953.png"
          alt="Atlas 3D Credit Cards"
          className="w-44 sm:w-56 lg:w-full max-w-[440px] h-auto object-contain drop-shadow-[0_20px_20px_rgba(128,10,56,0.18)] transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Form Area */}
      <div className="w-full order-last lg:order-first">
        <form
          onSubmit={showOTP ? handleVerifyLogin : handleSubmit}
          className="flex flex-col gap-3 w-full"
          noValidate
        >
          {/* 30-Minute Account Lockout Banner with Live Reverse Counter */}
          {lockUntil && timer ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-900 flex items-center justify-between shadow-xs">
              <div className="flex flex-col">
                <span className="font-bold">Account Temporarily Locked</span>
                <span className="text-[11px] text-amber-700 font-normal">Too many failed attempts. Try again in:</span>
              </div>
              <span className="font-mono font-extrabold bg-amber-200 text-amber-950 px-2.5 py-1 rounded-lg text-sm tracking-wider">
                {timer}
              </span>
            </div>
          ) : null}

          {/* Standard Error Message & Remaining Attempts Badge */}
          {serverError && !lockUntil && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-[#800A38] flex items-center justify-between">
              <span>{serverError}</span>
              {attemptsLeft !== null && attemptsLeft >= 0 && (
                <span className="text-[10px] bg-rose-100 text-[#800A38] px-2 py-0.5 rounded-full font-extrabold ml-2 shrink-0">
                  {attemptsLeft} attempts left
                </span>
              )}
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {!showOTP ? (
            <>
              <div className="w-full">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="chickenbaby1212@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                  disabled={Boolean(lockUntil) || loading}
                />
              </div>

              <div className="w-full">
                <PasswordInput
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                  disabled={Boolean(lockUntil) || loading}
                />
                <div className="mt-1 text-right">
                  <Link
                    to={ROUTES.FORGOT_PASSWORD || "/forgot-password"}
                    className="text-xs font-bold text-[#800A38] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={Boolean(lockUntil)}
                className="mt-0.5 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Sending Code..." : "Log in"}
              </Button>
            </>
          ) : (
            /* STEP 2: Verification Code Box (Appears on Same Page) */
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                Verification code sent to{" "}
                <span className="font-bold text-slate-900">{form.email}</span>
              </div>

              <div className="w-full">
                <Input
                  label="Verification Code (OTP)"
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  autoFocus
                  disabled={Boolean(lockUntil) || loading}
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={Boolean(lockUntil)}
                className="mt-0.5 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp("");
                  setServerError("");
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 text-center transition-colors py-1 cursor-pointer"
              >
                ← Back to Email / Password
              </button>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 mt-1">
            New to Atlas Bank?{" "}
            <Link
              to={ROUTES.REGISTER || "/register"}
              className="font-extrabold text-[#800A38] hover:underline"
            >
              Open an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}