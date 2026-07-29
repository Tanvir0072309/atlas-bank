import { useState } from "react";
import { Camera, ShieldCheck, ShieldAlert, KeyRound, Smartphone, Mail, Pencil } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { CUSTOMER, formatDate } from "../../data/mockData";
import { useToast } from "../../components/ui/Toast";

export default function Profile() {
  const [twoFA, setTwoFA] = useState(CUSTOMER.twoFactorEnabled);
  const [pwOpen, setPwOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const toast = useToast();

  const initials = CUSTOMER.name.split(" ").map((n) => n[0]).join("");

  const changePassword = (e) => {
    e.preventDefault();
    setPwOpen(false);
    toast?.showToast("Password updated successfully", "success");
  };

  const resendVerification = (kind) => {
    toast?.showToast(`Verification ${kind === "email" ? "email" : "SMS"} sent`, "success");
  };

  return (
    <div>
      <PageHeader title="My Profile" crumb="Profile" description="Manage your personal information and account security." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1 text-center">
          <div className="relative mx-auto w-fit">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#800A38] to-[#C4185C] text-2xl font-extrabold text-white shadow-lg shadow-[#800A38]/20">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#800A38] shadow-md border border-rose-100 hover:bg-rose-50">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-slate-900">{CUSTOMER.name}</h2>
          <p className="text-xs text-slate-400 break-all">Customer ID: {CUSTOMER.id}</p>
          <p className="mt-1 text-xs text-slate-400">Member since {formatDate(CUSTOMER.memberSince)}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge tone="success"><ShieldCheck className="h-3 w-3" /> {CUSTOMER.status}</Badge>
            <Badge tone="primary" className="capitalize">{CUSTOMER.role}</Badge>
          </div>
          <Button variant="secondary" size="sm" icon={Pencil} className="mt-5 w-full" onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Personal Information</h3>
          <dl className="grid gap-5 sm:grid-cols-2">
            {[
              ["Full Name", CUSTOMER.name],
              ["Email Address", CUSTOMER.email],
              ["Phone Number", CUSTOMER.mobile],
              ["Last Login", new Date(CUSTOMER.lastLogin).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 break-all">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 border-t border-rose-100 pt-5">
            {/* Email verification status */}
            <div className="flex items-center justify-between rounded-2xl bg-rose-50/50 border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${CUSTOMER.isEmailVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{CUSTOMER.isEmailVerified ? "Verified" : "Not Verified"}</p>
                </div>
              </div>
              {CUSTOMER.isEmailVerified ? (
                <Badge tone="success">Verified</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => resendVerification("email")}>Verify</Button>
              )}
            </div>

            {/* Phone verification status */}
            <div className="flex items-center justify-between rounded-2xl bg-rose-50/50 border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${CUSTOMER.isPhoneVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Phone</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{CUSTOMER.isPhoneVerified ? "Verified" : "Not Verified"}</p>
                </div>
              </div>
              {CUSTOMER.isPhoneVerified ? (
                <Badge tone="success">Verified</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => resendVerification("phone")}>Verify</Button>
              )}
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Security</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><KeyRound className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Password</p>
                  <p className="text-xs text-slate-400">Keep your account secure with a strong password</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPwOpen(true)}>Change</Button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-rose-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><ShieldAlert className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400">{twoFA ? "Enabled via authenticator app" : "Currently disabled"}</p>
                </div>
              </div>
              <button
                onClick={() => { setTwoFA((v) => !v); toast?.showToast(`Two-factor authentication ${!twoFA ? "enabled" : "disabled"}`, "success"); }}
                className={`relative h-6 w-11 rounded-full transition-colors ${twoFA ? "bg-[#800A38]" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Change password modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <form onSubmit={changePassword} className="space-y-4">
          {["Current Password", "New Password", "Confirm New Password"].map((label) => (
            <label key={label} className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
              <input type="password" required className="w-full rounded-xl border border-rose-100 py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]" />
            </label>
          ))}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>

      {/* Edit profile modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={(e) => { e.preventDefault(); setEditOpen(false); toast?.showToast("Profile updated successfully", "success"); }} className="space-y-4">
          {[
            ["Full Name", CUSTOMER.name],
            ["Email Address", CUSTOMER.email],
            ["Phone Number", CUSTOMER.mobile],
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
