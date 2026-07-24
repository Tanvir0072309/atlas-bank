const VARIANTS = {
  primary:
    "bg-[#800A38] text-white hover:bg-[#6b0830] shadow-md shadow-[#800A38]/20",
  secondary:
    "bg-rose-50 text-[#800A38] border border-rose-200 hover:bg-rose-100",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  outline: "border border-slate-200 text-slate-700 hover:border-[#800A38] hover:text-[#800A38]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export default function Button({
  as: As = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="h-4 w-4 shrink-0" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="h-4 w-4 shrink-0" />}
    </As>
  );
}
