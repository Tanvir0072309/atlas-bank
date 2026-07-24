import { useState } from "react";
import { Sun, Moon, Globe, Bell, Lock, Laptop, Smartphone, Eye, LogOut } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

const DEVICES = [
  { id: 1, name: "Chrome on Windows", location: "Ahmedabad, IN", icon: Laptop, current: true },
  { id: 2, name: "Atlas Bank App · iPhone 15", location: "Ahmedabad, IN", icon: Smartphone, current: false },
];

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-[#800A38]" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function Row({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-rose-50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#800A38]"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true, push: false });
  const [privacy, setPrivacy] = useState({ showBalance: true, dataSharing: false });
  const toast = useToast();

  const updateNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
  const updatePrivacy = (key) => setPrivacy((p) => ({ ...p, [key]: !p[key] }));

  const revokeDevice = (name) => toast?.showToast(`${name} has been signed out`, "success");

  return (
    <div>
      <PageHeader title="Settings" crumb="Settings" description="Customize your Atlas Bank experience and manage security preferences." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Appearance</h3>
          <Row icon={darkMode ? Moon : Sun} title="Dark Mode" description={darkMode ? "Dark theme enabled" : "Light theme enabled"}>
            <Toggle checked={darkMode} onChange={() => { setDarkMode((v) => !v); toast?.showToast(`Switched to ${!darkMode ? "dark" : "light"} mode`, "info"); }} />
          </Row>
          <Row icon={Globe} title="Language" description="Choose your preferred language">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border border-rose-100 bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#800A38]">
              <option>English</option>
              <option>हिंदी</option>
              <option>ગુજરાતી</option>
            </select>
          </Row>
        </Card>

        <Card>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Notification Preferences</h3>
          <Row icon={Bell} title="Email Notifications" description="Get alerts on your registered email">
            <Toggle checked={notifPrefs.email} onChange={() => updateNotif("email")} />
          </Row>
          <Row icon={Bell} title="SMS Notifications" description="Get alerts via SMS">
            <Toggle checked={notifPrefs.sms} onChange={() => updateNotif("sms")} />
          </Row>
          <Row icon={Bell} title="Push Notifications" description="Get alerts on this device">
            <Toggle checked={notifPrefs.push} onChange={() => updateNotif("push")} />
          </Row>
        </Card>

        <Card>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Security Settings</h3>
          <Row icon={Lock} title="Login Alerts" description="Notify me of every new sign-in">
            <Toggle checked={true} onChange={() => {}} />
          </Row>
          <Row icon={Lock} title="Biometric Login" description="Use fingerprint / Face ID on this device">
            <Toggle checked={true} onChange={() => {}} />
          </Row>
        </Card>

        <Card>
          <h3 className="mb-1 text-sm font-bold text-slate-900">Privacy Settings</h3>
          <Row icon={Eye} title="Show Balance on Dashboard" description="Hide amounts when sharing your screen">
            <Toggle checked={privacy.showBalance} onChange={() => updatePrivacy("showBalance")} />
          </Row>
          <Row icon={Eye} title="Personalized Offers" description="Allow usage data for tailored offers">
            <Toggle checked={privacy.dataSharing} onChange={() => updatePrivacy("dataSharing")} />
          </Row>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-1 text-sm font-bold text-slate-900">Connected Devices</h3>
          {DEVICES.map((d) => (
            <Row key={d.id} icon={d.icon} title={d.name} description={d.location}>
              {d.current ? (
                <span className="text-xs font-bold text-emerald-600">This device</span>
              ) : (
                <Button size="sm" variant="danger" icon={LogOut} onClick={() => revokeDevice(d.name)}>Sign out</Button>
              )}
            </Row>
          ))}
        </Card>
      </div>
    </div>
  );
}
