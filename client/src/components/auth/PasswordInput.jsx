import { forwardRef, useState } from "react";
import Input from "../common/Input.jsx";

const PasswordInput = forwardRef(({ label = "Password", ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} label={label} type={visible ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-4 top-[38px] text-xs font-semibold text-brand-500 hover:text-brand-600"
        tabIndex={-1}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
