import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Input from "../common/Input.jsx";
import PasswordInput from "./PasswordInput.jsx";
import Button from "../common/Button.jsx";
import { useAuth } from "../../hooks/useAuth";
import { validateLoginForm } from "../../utils/validators";
import { ROUTES } from "../../utils/constants";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        navigate(ROUTES.VERIFY_EMAIL, { state: { email: form.email } });
        return;
      }
      setServerError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center w-full">

      {/* 3D Visual Section (Mobile Top, Desktop Right) */}
      <div className="flex w-full items-center justify-center order-first lg:order-last py-1 lg:py-0">
        <img
          src="https://cdn3d.iconscout.com/3d/premium/thumb/credit-cards-3d-icon-png-download-4655953.png"
          alt="Atlas 3D Credit Cards"
          className="w-44 sm:w-56 lg:w-full max-w-[440px] h-auto object-contain drop-shadow-[0_20px_20px_rgba(128,10,56,0.18)] transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Form Section */}
      <div className="w-full order-last lg:order-first">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full" noValidate>
          {serverError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-[#800A38]">
              {serverError}
            </div>
          )}

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
            className="mt-0.5 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-60 cursor-pointer"
          >
            Log in
          </Button>

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