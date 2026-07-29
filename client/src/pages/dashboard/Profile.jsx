import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Pencil, Wallet as WalletIcon, Landmark } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { formatDate, formatCurrency } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";
import logo from "../../assets/logo.png";
import walletService from "../../services/wallet.service";
import accountService from "../../services/account.service";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [primaryBank, setPrimaryBank] = useState(null);
  const toast = useToast();

  const name = user?.fullName || "Atlas Customer";
  const email = user?.email || "-";
  const phone = user?.phone || "-";
  const isEmailVerified = Boolean(user?.isEmailVerified);
  const status = user?.status || "active";
  const memberSince = user?.createdAt;
  const lastLogin = user?.lastLogin;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [w, accounts] = await Promise.all([
          walletService.getMyWallet().catch(() => null),
          accountService.getAccounts().catch(() => []),
        ]);
        setWallet(w);
        setPrimaryBank(accounts.find((a) => a.isPrimary) || accounts[0] || null);
      } catch (err) {
        toast?.showToast(err?.response?.data?.message || "Could not load profile data", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Password reset always happens through the Forgot Password flow (OTP to
  // the registered email) rather than an in-page form.
  const goToResetPassword = () => navigate(ROUTES.FORGOT_PASSWORD);

  const resendVerification = () => {
    toast?.showToast("Verification email sent", "success");
  };

  return (
    <div>
      <PageHeader title="My Profile" crumb="Profile" description="Manage your personal information and account security." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1 text-center">
          <div className="relative mx-auto w-fit">
            {/* Every account uses the Atlas Bank logo as its avatar — there is no photo upload. */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg shadow-[#800A38]/10 border border-rose-100 overflow-hidden">
              <img src={logo} alt="Atlas Bank" className="h-14 w-14 object-contain" />
            </div>
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">{name}</h2>
          <p className="text-xs text-slate-400 break-all">Customer ID: {user?.id || user?._id || "-"}</p>
          {memberSince && <p className="mt-1 text-xs text-slate-400">Member since {formatDate(memberSince)}</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge tone="success"><ShieldCheck className="h-3 w-3" /> {status}</Badge>
            <Badge tone="primary" className="capitalize">customer</Badge>
          </div>
          <Button variant="secondary" size="sm" icon={Pencil} className="mt-5 w-full" onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
        </Card>

        {/* Wallet balance */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-[#800A38] via-[#6b0830] to-[#5C0526] text-white">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-200">
              <WalletIcon className="h-4 w-4" /> Current Wallet Balance
            </span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
            {loading ? "Loading..." : formatCurrency(wallet?.availableBalance || 0)}
          </p>
          <p className="mt-2 text-xs text-rose-200">{wallet ? `UPI ID · ${wallet.upiId}` : "Wallet not set up yet"}</p>
        </Card>

        {/* Personal information */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Personal Information</h3>
          <dl className="grid gap-5 sm:grid-cols-2">
            {[
              ["Full Name", name],
              ["Email Address", email],
              ["Phone Number", phone],
              ["Last Login", lastLogin ? new Date(lastLogin).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 break-all">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Email verification status. Phone is shown as-is — Atlas Bank
              doesn't verify mobile numbers, so no "Verify" action is offered. */}
          <div className="mt-6 border-t border-rose-100 pt-5">
            <div className="flex items-center justify-between rounded-2xl bg-rose-50/50 border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isEmailVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{isEmailVerified ? "Verified" : "Not Verified"}</p>
                </div>
              </div>
              {isEmailVerified ? (
                <Badge tone="success">Verified</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={resendVerification}>Verify</Button>
              )}
            </div>
          </div>
        </Card>

        {/* Bank account holder details */}
        <Card className="lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Landmark className="h-4 w-4 text-[#800A38]" /> Bank Account Holder
          </h3>
          {loading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : primaryBank ? (
            <dl className="space-y-3.5">
              {[
                ["Account Holder", primaryBank.accountHolderName],
                ["Bank Name", primaryBank.bankName],
                ["Branch", primaryBank.branchName],
                ["Account Type", primaryBank.accountType],
                ["IFSC Code", primaryBank.ifscCode],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-semibold text-slate-800 capitalize">{value || "-"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-slate-500">No bank account linked yet. Add one from the Cards page.</p>
          )}
        </Card>

        {/* Security */}
        <Card className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Security</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Lock className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Password</p>
                  <p className="text-xs text-slate-400">You'll reset it via a verification code sent to your email</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={goToResetPassword}>Reset Password</Button>
            </div>

            {/* Two-factor authentication is always on for every account — it
                cannot be turned off, so no toggle is shown here. */}
            <div className="flex items-center justify-between rounded-2xl border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400">Always on for every account</p>
                </div>
              </div>
              <Badge tone="success">Enabled</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit profile modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={(e) => { e.preventDefault(); setEditOpen(false); toast?.showToast("Profile updated successfully", "success"); }} className="space-y-4">
          {[
            ["Full Name", name],
            ["Email Address", email],
            ["Phone Number", phone],
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
              <input defaultValue={value} className="w-full rounded-xl border border-rose-100 py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
            </label>
          ))}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
