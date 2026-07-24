import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { LogOut } from "lucide-react";

export default function LogoutModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Log out of Atlas Bank?">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <LogOut className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          You'll need to sign in again to access your accounts, transfers and statements.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button variant="danger" size="md" icon={LogOut} onClick={onConfirm}>Log out</Button>
      </div>
    </Modal>
  );
}
