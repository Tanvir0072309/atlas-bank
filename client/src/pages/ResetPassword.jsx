import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import Input from "../components/common/Input.jsx";
import PasswordInput from "../components/auth/PasswordInput.jsx";
import Button from "../components/common/Button.jsx";
import { authService } from "../services/auth.service";
import { isValidPassword } from "../utils/validators";
import { ROUTES } from "../utils/constants";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
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
    const nextErrors = {};
    if (!form.otp || form.otp.length < 6) nextErrors.otp = "Enter the 6-digit code.";
    if (!isValidPassword(form.password))
      nextErrors.password = "Password needs 8+ characters, upper & lower case, a number and a symbol.";
    if (form.password !== form.confirmPassword)
      nextErrors.confirmPassword = "Passwords don't match.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setServerError("");
    setLoading(true);
    try {
      await authService.resetPassword(form);
      navigate(ROUTES.LOGIN, { state: { reset: true } });
    } catch (err) {
      setServerError(err?.response?.data?.message || "That code is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Set a new password."
      subtitle="Choose something strong you haven't used before."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <h2 className="font-display text-2xl text-ink">Create new password</h2>
          <p className="mt-1 text-sm text-muted">
            Enter the code sent to <span className="font-semibold text-ink">{form.email}</span>.
          </p>
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
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="6-digit code"
          name="otp"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={form.otp}
          onChange={handleChange}
          error={errors.otp}
        />
        <PasswordInput
          label="New password"
          name="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="mt-2">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
