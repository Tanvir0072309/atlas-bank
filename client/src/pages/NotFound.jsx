import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { BANK_NAME, ROUTES } from "../utils/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#FAF7F8] px-6 text-center font-sans">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#800A38] p-3 shadow-lg shadow-[#800A38]/20">
        <img src={logo} alt={BANK_NAME} className="h-full w-full object-contain brightness-0 invert" />
      </div>
      <p className="text-7xl font-extrabold text-[#800A38]">404</p>
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">This page moved vaults.</h1>
        <p className="mt-2 text-xs text-slate-600">
          The page you're looking for doesn't exist or has been relocated.
        </p>
      </div>
      <Link
        to={ROUTES.HOME || "/"}
        className="rounded-full bg-[#800A38] px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#A30E4A] transition-all"
      >
        Back to Safety
      </Link>
    </div>
  );
}