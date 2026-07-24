import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import api from "../api/axios";
import { ROUTES } from "../utils/constants";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      nextErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      await api.post("/auth/register", formData);
      setIsSent(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout
        eyebrow="Verification Sent"
        title="Check Your Inbox"
        subtitle={`We've sent a verification link to ${formData.email}`}
      >
        <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-[#800A38]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
            Please click on the link in your email to verify your account. Once verified, you will be redirected to the Atlas Bank dashboard.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 w-full">
            Didn't receive the email? Check your spam folder or try re-registering.
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Open Account"
      title="Create Your Atlas Account"
      subtitle="Join Atlas Bank and connect your finances in under 2 minutes."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center w-full">

        {/* 3D Image Section: Mobile par Upar (order-first), Desktop par Right (lg:order-last) */}
        <div className="flex w-full items-center justify-center order-first lg:order-last py-2 lg:py-0">
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/credit-cards-3d-icon-png-download-4655953.png"
            alt="Atlas 3D Credit Cards"
            className="w-48 sm:w-64 lg:w-full max-w-[380px] h-auto object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Form Section: Mobile par Niche, Desktop par Left (lg:order-first) */}
        <div className="w-full order-last lg:order-first">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full" noValidate>
            {serverError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-[#800A38]">
                {serverError}
              </div>
            )}

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Tanvir Khan"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white ${errors.fullName
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-300 focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10"
                  }`}
              />
              {errors.fullName && <p className="text-[10px] text-red-600 mt-0.5">{errors.fullName}</p>}
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="chickenbaby1212@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white ${errors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-300 focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10"
                  }`}
              />
              {errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                placeholder="9327673403"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white ${errors.phone
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-300 focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10"
                  }`}
              />
              {errors.phone && <p className="text-[10px] text-red-600 mt-0.5">{errors.phone}</p>}
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Atlas@123"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all outline-none bg-slate-50/50 focus:bg-white ${errors.password
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-slate-300 focus:border-[#800A38] focus:ring-2 focus:ring-[#800A38]/10"
                  }`}
              />
              {errors.password && <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-full bg-[#800A38] py-3 text-xs font-extrabold text-white shadow-md shadow-[#800A38]/20 hover:bg-[#A30E4A] transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-xs text-slate-500 mt-1">
              Already have an account?{" "}
              <Link to={ROUTES.LOGIN || "/login"} className="font-extrabold text-[#800A38] hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>

      </div>
    </AuthLayout>
  );
}