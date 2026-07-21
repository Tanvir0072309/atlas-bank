import { forwardRef } from "react";
import { classNames } from "../../utils/helpers";

const Input = forwardRef(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-ink/80"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={classNames(
            "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-brand-500 focus:outline-none",
            error ? "border-red-400" : "border-brand-100",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
