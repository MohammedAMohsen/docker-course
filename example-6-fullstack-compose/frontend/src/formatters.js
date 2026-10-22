export const STATUS_LABELS = {
  todo: "قيد الانتظار",
  in_progress: "قيد التنفيذ",
  done: "مكتملة",
};

export const PRIORITY_LABELS = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
};

export function formatArabicDate(value, options = {}) {
  if (!value) return "غير محدد";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "تاريخ غير صالح";
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", ...options }).format(date);
}

export function isOverdue(task) {
  if (!task?.due_date || task.status === "done") return false;
  const due = new Date(`${task.due_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
