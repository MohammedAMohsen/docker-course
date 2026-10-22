import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  category: "عام",
  status: "todo",
  priority: "medium",
  due_date: "",
};

export default function TaskModal({ task, initialValues, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "عام",
        status: task.status || "todo",
        priority: task.priority || "medium",
        due_date: task.due_date || "",
      });
    } else {
      setForm({ ...emptyForm, ...(initialValues || {}) });
    }
    setError("");
  }, [task, initialValues]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("أضف عنواناً قصيراً للمهمة للمتابعة.");
      return;
    }
    setError("");
    const payload = { ...form, title: form.title.trim(), category: form.category.trim() || "عام", due_date: form.due_date || null };
    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError.message || "تعذر حفظ المهمة. حاول مرة أخرى.");
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">مساحة العمل</span>
            <h2 id="task-modal-title">{task ? "تعديل المهمة" : "مهمة جديدة"}</h2>
          </div>
          <button className="icon-button modal-close" type="button" onClick={onClose} disabled={saving} aria-label="إغلاق النافذة"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="task-form">
          <label className="field-label" htmlFor="task-title">عنوان المهمة <span>*</span></label>
          <input id="task-title" className="form-control" autoFocus maxLength={180} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="مثال: مراجعة أساسيات Docker" required />

          <label className="field-label" htmlFor="task-description">تفاصيل <small>اختياري</small></label>
          <textarea id="task-description" className="form-control textarea-control" maxLength={1200} rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="أضف تفاصيل تساعدك على البدء..." />

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="task-category">التصنيف</label>
              <input id="task-category" className="form-control" maxLength={48} value={form.category} onChange={(event) => update("category", event.target.value)} placeholder="عام" />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="task-due-date">تاريخ الاستحقاق</label>
              <div className="input-with-icon"><CalendarDays size={16} aria-hidden="true" /><input id="task-due-date" className="form-control" type="date" value={form.due_date} onChange={(event) => update("due_date", event.target.value)} /></div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="task-priority">الأولوية</label>
              <select id="task-priority" className="form-control" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
                <option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option>
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="task-status">الحالة</label>
              <select id="task-status" className="form-control" value={form.status} onChange={(event) => update("status", event.target.value)}>
                <option value="todo">قيد الانتظار</option><option value="in_progress">قيد التنفيذ</option><option value="done">مكتملة</option>
              </select>
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-footer">
            <button className="button button-quiet" type="button" onClick={onClose} disabled={saving}>إلغاء</button>
            <button className="button button-primary" type="submit" disabled={saving}>{saving ? "جارٍ الحفظ…" : task ? "حفظ التعديلات" : "إضافة المهمة"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
