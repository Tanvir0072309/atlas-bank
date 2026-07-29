import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Mail, Phone, AlertTriangle, LifeBuoy, Clock, Sparkles, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const SUPPORT_EMAIL = "mrtanvir0072@gmail.com";
const SUPPORT_PHONE = "9327673402";

const FAQS = [
  { q: "How do I add money to my wallet?", a: "Go to Transactions, use the \"Bank Account → Wallet\" form, enter the amount, and confirm. Funds are added instantly." },
  { q: "How do I send money to someone?", a: "Open Transactions, enter the receiver's UPI ID and amount in the UPI Transfer form, then confirm. You'll see a live transfer animation while it processes." },
  { q: "Is my bank account information secure?", a: "Yes. Your bank details are encrypted at rest and only used to move money between your bank account and wallet. You can remove a linked account anytime from the Cards section." },
  { q: "What do I do if a transaction fails?", a: "Failed transactions are automatically reversed to your wallet or bank account. Check Transaction History for the latest status, or report the issue below." },
  { q: "How do I verify my email?", a: "Go to My Profile → Personal Information. If the Email badge shows \"Not Verified\", click Verify to resend a verification link." },
  { q: "Is two-factor authentication optional?", a: "No — two-factor authentication is always on for every Atlas Bank account and cannot be disabled, for your security." },
];

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const toast = useToast();

  const submitReport = (e) => {
    e.preventDefault();
    setReportOpen(false);
    toast?.showToast("Your issue has been reported. Our team will get back to you shortly.", "success");
  };

  return (
    <div>
      <PageHeader title="Help Center" crumb="Help Center" description="Find answers, contact support, or report an issue." />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800A38] via-[#6b0830] to-[#5C0526] p-6 sm:p-8 text-white mb-5"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-200">
          <Sparkles className="h-4 w-4" /> We're here to help
        </div>
        <h2 className="relative mt-3 text-xl sm:text-2xl font-extrabold tracking-tight">
          Get support from the Atlas Bank team
        </h2>
        <p className="relative mt-2 max-w-xl text-sm text-rose-100">
          Reach out by email or phone, browse answers to common questions, or report an issue directly — our team responds fast.
        </p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* FAQs */}
        <Card noPadding className="lg:col-span-2">
          <div className="flex items-center gap-2 p-5 sm:p-6 pb-3">
            <LifeBuoy className="h-4.5 w-4.5 text-[#800A38]" />
            <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-rose-50 px-5 sm:px-6 pb-4">
            {FAQS.map((item, i) => (
              <div key={item.q} className="py-3">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                {openIndex === i && <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.a}</p>}
              </div>
            ))}
          </div>
        </Card>

        {/* Contact + report */}
        <div className="space-y-5">
          <Card>
            <h3 className="mb-4 text-sm font-bold text-slate-900">Contact Support</h3>
            <div className="space-y-3">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 rounded-2xl border border-rose-100 p-3.5 hover:bg-rose-50/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Mail className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Email Us</p>
                  <p className="truncate text-[11px] text-slate-400">{SUPPORT_EMAIL}</p>
                </div>
              </a>
              <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-3 rounded-2xl border border-rose-100 p-3.5 hover:bg-rose-50/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Phone className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Call Us</p>
                  <p className="text-[11px] text-slate-400">{SUPPORT_PHONE}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Clock className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Support Hours</p>
                  <p className="text-[11px] text-slate-400">9 AM – 9 PM, all days</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Report an Issue</h3>
            <p className="mt-1 text-xs text-slate-500">Facing a bug, a failed transaction, or something suspicious? Let us know.</p>
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setReportOpen(true)}>
              Report Issue
            </Button>
          </Card>

          <Card className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-4.5 w-4.5" /></div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Atlas Bank support will never ask for your password or OTP over phone or email. Only share account details through this app.
            </p>
          </Card>
        </div>
      </div>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report an Issue">
        <form onSubmit={submitReport} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Category</span>
            <select required className="w-full rounded-xl border border-rose-100 py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38]">
              <option>Failed / Incorrect Transaction</option>
              <option>Login or Account Access</option>
              <option>App Bug or Crash</option>
              <option>Suspicious Activity</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wide">Describe the issue</span>
            <textarea required rows={4} placeholder="Tell us what happened..." className="w-full rounded-xl border border-rose-100 py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800A38]/10 focus:border-[#800A38] resize-none" />
          </label>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
