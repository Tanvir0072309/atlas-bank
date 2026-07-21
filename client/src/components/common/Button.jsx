import Spinner from "./Spinner.jsx";
import { classNames } from "../../utils/helpers";

const variants = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-card disabled:bg-brand-300",
  outline:
    "border border-brand-500 text-brand-500 hover:bg-brand-50 disabled:opacity-50",
  ghost: "text-brand-500 hover:bg-brand-50 disabled:opacity-50",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames(
        "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-150 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && <Spinner size={16} className="text-current" />}
      {children}
    </button>
  );
}
