import { CalendarDays, Check, Clock3, Pencil, Trash2 } from "lucide-react";
import { formatArabicDate, isOverdue, PRIORITY_LABELS, STATUS_LABELS } from "../formatters.js";

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, compact = false, draggable = false }) {
  const overdue = isOverdue(task);
  return (
    <article
      className={`task-card ${compact ? "task-card-compact" : ""} ${task.status === "done" ? "task-is-done" : ""}`}
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
        event.currentTarget.classList.add("is-dragging");
      }}
      onDragEnd={(event) => event.currentTarget.classList.remove("is-dragging")}
    >
      <div className={`task-priority priority-${task.priority}`} aria-label={`الأولوية ${PRIORITY_LABELS[task.priority]}`} />
      <div className="task-card-body">
        <div className="task-card-top">
          <span className="category-tag">{task.category || "عام"}</span>
          <div className="task-actions">
            <button className="icon-button" type="button" onClick={() => onEdit(task)} aria-label={`تعديل ${task.title}`} title="تعديل"><Pencil size={14} /></button>
            <button className="icon-button danger-hover" type="button" onClick={() => onDelete(task)} aria-label={`حذف ${task.title}`} title="حذف"><Trash2 size={14} /></button>
          </div>
        </div>
        <h3 className="task-title">{task.title}</h3>
        {!compact && task.description && <p className="task-description">{task.description}</p>}
        <div className="task-card-bottom">
          <div className={`task-due ${overdue ? "is-overdue" : ""}`}>
            <CalendarDays size={13} aria-hidden="true" />
            <span>{task.due_date ? formatArabicDate(task.due_date) : "بلا موعد"}</span>
            {overdue && <span className="overdue-label">متأخرة</span>}
          </div>
          <div className="task-card-controls">
            <span className={`priority-label label-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
            {task.status === "done" ? (
              <span className="task-done-mark"><Check size={13} /> مكتملة</span>
            ) : (
              <label className={`status-select-wrap status-${task.status}`}>
                <Clock3 size={13} aria-hidden="true" />
                <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)} aria-label={`حالة المهمة: ${task.title}`}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
