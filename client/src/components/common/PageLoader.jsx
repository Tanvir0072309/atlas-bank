import logo from "../../assets/logo.png";
import { BANK_NAME } from "../../utils/constants";

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-cream">
      <img src={logo} alt={BANK_NAME} className="h-12 w-12 animate-pulse" />
      <div className="h-1 w-32 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full w-1/3 animate-[loadingBar_1.1s_ease-in-out_infinite] rounded-full bg-brand-500" />
      </div>
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
