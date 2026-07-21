import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <h2 className="font-display text-2xl text-ink">Welcome back</h2>
        <p className="mt-1 text-sm text-muted">Log in to manage your accounts.</p>
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {serverError}
        </p>
      )}

      <Input
        label="Email address"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
      />
      <div>
        <PasswordInput
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="mt-2 text-right">
          <a
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs font-semibold text-brand-500 hover:text-brand-600"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <Button type="submit" loading={loading} className="mt-2">
        Log in
      </Button>

      <p className="text-center text-sm text-muted">
        New to Atlas Bank?{" "}
        <a href={ROUTES.REGISTER} className="font-semibold text-brand-500 hover:text-brand-600">
          Open an account
        </a>
      </p>
    </form>
  );
}
