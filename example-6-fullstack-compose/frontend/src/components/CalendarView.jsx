import { useMemo } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";
import { formatArabicDate, STATUS_LABELS } from "../formatters.js";

const weekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const pad = (n) => String(n).padStart(2, "0");
export const localDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export default function CalendarView({ month, tasks, selectedDate, onSelectDate, loading, onMonthChange, onCreate, onEdit }) {
  const [year, monthNumber] = month.split("-").map(Number);
  const monthDate = new Date(year, monthNumber - 1, 1);
  const todayKey = localDateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("ar", { month: "long", year: "numeric" }).format(monthDate);
  const firstOffset = (monthDate.getDay() + 1) % 7;
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const tasksByDay = useMemo(() => {
    const map = new Map();
    for (const task of tasks) {
      if (!task.due_date) continue;
      const list = map.get(task.due_date) || [];
      list.push(task);
      map.set(task.due_date, list);
    }
    return map;
  }, [tasks]);
  const selectedTasks = tasksByDay.get(selectedDate) || [];
  const selectedLabel = formatArabicDate(selectedDate, { weekday: "long", year: "numeric" });
  const cells = [...Array(firstOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function chooseMonth(amount) {
    onMonthChange(monthKey(addMonths(monthDate, amount)), localDateKey(addMonths(monthDate, amount)));
  }

  return (
    <div className="page-content calendar-page">
      <section className="page-intro calendar-intro">
        <div><span className="section-eyebrow"><CalendarDays size={13} /> وقتك بيدك</span><h1>التقويم</h1><p>رتّب مواعيدك على مرأى منك، وخذ اليوم خطوة بخطوة.</p></div>
        <button className="button button-primary" type="button" onClick={() => onCreate({ due_date: selectedDate })}><Plus size={16} /> أضف موعداً</button>
      </section>
      <section className="calendar-layout">
        <div className="panel calendar-panel">
          <div className="calendar-header">
            <div className="month-heading"><span className="month-icon"><CalendarDays size={18} /></span><div><span className="section-eyebrow">عرض شهري</span><h2>{monthLabel}</h2></div></div>
            <div className="calendar-controls"><button className="calendar-today" type="button" onClick={() => onMonthChange(monthKey(new Date()), todayKey)}>اليوم</button><button className="calendar-arrow" type="button" onClick={() => chooseMonth(-1)} aria-label="الشهر السابق"><ChevronRight size={18} /></button><button className="calendar-arrow" type="button" onClick={() => chooseMonth(1)} aria-label="الشهر التالي"><ChevronLeft size={18} /></button></div>
          </div>
          <div className="calendar-grid" role="grid" aria-label={`تقويم ${monthLabel}`}>
            {weekDays.map((day) => <div className="calendar-weekday" role="columnheader" key={day}>{day}</div>)}
            {cells.map((day, index) => {
              if (!day) return <div className="calendar-cell calendar-blank" role="gridcell" key={`empty-${index}`} />;
              const key = `${year}-${pad(monthNumber)}-${pad(day)}`;
              const dayTasks = tasksByDay.get(key) || [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              return (
                <button type="button" role="gridcell" aria-selected={isSelected} aria-label={`${day} ${monthLabel}، ${dayTasks.length} مهام`} key={key} className={`calendar-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`} onClick={() => onSelectDate(key)}>
                  <span className="calendar-day-number">{day}</span>
                  {dayTasks.length > 0 && <span className="calendar-events"><span className="calendar-event-dots">{dayTasks.slice(0, 3).map((task) => <i className={`event-dot event-${task.status}`} key={task.id} />)}</span><span className="calendar-event-count">{dayTasks.length} مهام</span></span>}
                  {dayTasks.length > 0 && <span className="calendar-day-titles">{dayTasks.slice(0, 2).map((task) => <span key={task.id}>{task.title}</span>)}</span>}
                </button>
              );
            })}
          </div>
          {loading && <div className="calendar-loading"><span className="spinner" /> جار تحديث مواعيد الشهر…</div>}
          <div className="calendar-legend"><span><i className="event-dot event-todo" /> قيد الانتظار</span><span><i className="event-dot event-in_progress" /> قيد التنفيذ</span><span><i className="event-dot event-done" /> مكتملة</span></div>
        </div>
        <aside className="panel calendar-agenda">
          <div className="agenda-date"><span className="agenda-date-icon"><CalendarDays size={17} /></span><span><small>مواعيد اليوم المختار</small><strong>{selectedLabel}</strong></span></div>
          <div className="agenda-divider" />
          <div className="agenda-list-heading"><strong>المهام</strong><span>{selectedTasks.length}</span></div>
          {selectedTasks.length ? <div className="agenda-list">{selectedTasks.map((task) => <button className="agenda-task" type="button" key={task.id} onClick={() => onEdit(task)}><i className={`agenda-status status-${task.status}`} /><span><strong>{task.title}</strong><small>{STATUS_LABELS[task.status]} · {task.category}</small></span><ArrowRight size={14} /></button>)}</div> : <div className="agenda-empty"><span><Sparkles size={18} /></span><strong>اليوم فارغ حتى الآن</strong><p>أضف موعداً أو اختر يوماً آخر من التقويم.</p></div>}
          <button className="button button-outline agenda-add" type="button" onClick={() => onCreate({ due_date: selectedDate })}><Plus size={15} /> أضف مهمة لهذا اليوم</button>
          <div className="agenda-tip"><Sparkles size={14} /><span>المواعيد والمهام محفوظة في مساحة العمل.</span></div>
        </aside>
      </section>
    </div>
  );
}
