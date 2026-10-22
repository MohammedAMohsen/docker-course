import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ task, onCancel, onConfirm, deleting }) {
  if (!task) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !deleting && onCancel()}>
      <section className="confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
        <button className="icon-button confirm-close" type="button" onClick={onCancel} disabled={deleting} aria-label="إغلاق"><X size={18} /></button>
        <div className="confirm-icon"><AlertTriangle size={22} /></div>
        <h2 id="delete-title">حذف هذه المهمة؟</h2>
        <p id="delete-description">سيتم حذف «{task.title}» نهائياً من مساحة العمل.</p>
        <div className="modal-footer confirm-actions">
          <button className="button button-quiet" type="button" onClick={onCancel} disabled={deleting}>إبقاء المهمة</button>
          <button className="button button-danger" type="button" onClick={onConfirm} disabled={deleting}>{deleting ? "جارٍ الحذف…" : "حذف نهائياً"}</button>
        </div>
      </section>
    </div>
  );
}
