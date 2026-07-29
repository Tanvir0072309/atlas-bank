import { useState } from "react";
import { ChevronDown, Mail, Phone, MessageCircle, AlertTriangle, LifeBuoy } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const FAQS = [
  { q: "How do I add money to my wallet?", a: "Go to Transactions → Transfer Money, switch to the \"Bank Account → Wallet\" tab, enter the amount, and confirm. Funds are added instantly." },
  { q: "How do I send money to someone?", a: "Open Transactions → Transfer Money, enter the receiver's UPI ID and amount, then confirm the transfer. You'll see a live transfer animation while it processes." },
  { q: "Is my bank account information secure?", a: "Yes. Your bank details are encrypted and only used to move money between your bank account and wallet. You can remove a linked account anytime from the Cards section." },
  { q: "What do I do if a transaction fails?", a: "Failed transactions are automatically reversed to your wallet or bank account within 24 hours. Check Transaction History for the latest status, or report the issue below." },
  { q: "How do I verify my email or phone number?", a: "Go to My Profile → Personal Information. If a badge shows \"Pending\", click it to resend a verification link or code." },
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
              <a href="mailto:support@atlasbank.com" className="flex items-center gap-3 rounded-2xl border border-rose-100 p-3.5 hover:bg-rose-50/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Mail className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Email Us</p>
                  <p className="truncate text-[11px] text-slate-400">support@atlasbank.com</p>
                </div>
              </a>
              <a href="tel:18001234567" className="flex items-center gap-3 rounded-2xl border border-rose-100 p-3.5 hover:bg-rose-50/50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Phone className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Call Us</p>
                  <p className="text-[11px] text-slate-400">1800-123-4567 (Toll-free)</p>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-2xl border border-rose-100 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><MessageCircle className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Live Chat</p>
                  <p className="text-[11px] text-slate-400">Available 9 AM – 9 PM, all days</p>
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
