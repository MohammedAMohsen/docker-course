import { useEffect } from "react";
import { AlertCircle, Check, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;
  const StatusIcon = toast.type === "error" ? AlertCircle : Check;
  return (
    <div className={`toast toast-${toast.type || "success"}`} role="status" aria-live="polite">
      <span className="toast-icon"><StatusIcon size={16} /></span>
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="إغلاق الإشعار"><X size={16} /></button>
    </div>
  );
}
