import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { formatArabicDate, isOverdue, PRIORITY_LABELS } from "../formatters.js";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 18) return "نهارك جميل";
  return "مساء الخير";
}

function dateKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function DashboardView({ summary, tasks, loading, onCreate, onEdit, onDelete, onStatusChange, onNavigate }) {
  const today = dateKey();
  const todayTasks = tasks.filter((task) => task.due_date === today && task.status !== "done");
  const urgentTasks = tasks.filter((task) => task.status !== "done" && (isOverdue(task) || task.priority === "high"));
  const highlighted = [...todayTasks, ...urgentTasks.filter((task) => !todayTasks.some((item) => item.id === task.id))];
  const spotlight = (highlighted.length ? highlighted : tasks.filter((task) => task.status !== "done")).slice(0, 4);
  const focusMinutes = Number(summary.focus_minutes_today) || 0;
  const goalProgress = Math.min(100, Math.round(focusMinutes / 60 * 100));
  const currentDate = new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const greetingName = greeting();

  return (
    <div className="page-content dashboard-page">
      <section className="welcome-hero">
        <div className="welcome-copy-block">
          <div className="welcome-date"><span className="date-pulse" />{currentDate}</div>
          <p className="welcome-greeting">{greetingName}،</p>
          <h1>خلّ تركيزك <span>يصنع الفرق.</span></h1>
          <p className="welcome-subtitle">رتّب أولوياتك، خذ خطوة واضحة، ودع التقدّم يتراكم.</p>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={onCreate}><Plus size={17} /> أضف مهمة</button>
            <button className="button button-soft" type="button" onClick={() => onNavigate("board")}><span>اذهب للوحة</span><ArrowLeft size={16} /></button>
          </div>
        </div>
        <div className="hero-focus-card">
          <div className="hero-card-top"><span className="hero-card-icon"><Sparkles size={17} /></span><span className="hero-card-label">هدف التركيز اليومي</span></div>
          <div className="hero-progress-wrap">
            <div className="hero-progress-ring" style={{ "--goal-progress": `${goalProgress}%` }}>
              <div className="hero-progress-inner"><strong>{focusMinutes}<small>د</small></strong><span>من ٦٠ دقيقة</span></div>
            </div>
            <div className="hero-progress-copy"><strong>{goalProgress >= 100 ? "أحسنت! أكملت هدفك" : "كل دقيقة تُحسب"}</strong><span>{goalProgress >= 100 ? "حافظ على هذا الإيقاع" : `باقي ${Math.max(0, 60 - focusMinutes)} دقيقة على هدف اليوم`}</span></div>
          </div>
          <button className="hero-focus-link" type="button" onClick={() => onNavigate("focus")}>ابدأ جلسة تركيز <ArrowUpLeft size={15} /></button>
        </div>
        <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
      </section>

      <div className="section-title-row overview-stats-heading">
        <div><span className="section-eyebrow">إيقاعك اليومي</span><h2>نظرة على مساحتك</h2></div>
        <span className="updated-hint"><span className="live-dot" /> محدث الآن</span>
      </div>

      <section className="overview-stats" aria-label="ملخص العمل">
        <article className="overview-stat stat-purple"><span className="overview-stat-icon"><Target size={18} /></span><span className="overview-stat-label">كل المهام</span><strong>{summary.total || 0}</strong><span className="overview-stat-foot">في مساحة العمل</span></article>
        <article className="overview-stat stat-blue"><span className="overview-stat-icon"><Clock3 size={18} /></span><span className="overview-stat-label">قيد التنفيذ</span><strong>{summary.in_progress || 0}</strong><span className="overview-stat-foot">خطواتك الحالية</span></article>
        <article className="overview-stat stat-green"><span className="overview-stat-icon"><CheckCircle2 size={18} /></span><span className="overview-stat-label">أنجزتها</span><strong>{summary.completed || 0}</strong><span className="overview-stat-foot"><TrendingUp size={12} /> {summary.completion_rate || 0}% من إجمالي المهام</span></article>
        <article className="overview-stat stat-orange"><span className="overview-stat-icon"><Flame size={18} /></span><span className="overview-stat-label">تحتاج انتباهك</span><strong>{summary.overdue || 0}</strong><span className="overview-stat-foot">مهام متأخرة</span></article>
      </section>

      <div className="overview-columns">
        <section className="panel today-panel">
          <div className="panel-heading">
            <div><span className="section-eyebrow">ابدأ بما يهم</span><h2>خطة اليوم <span className="inline-count">{spotlight.length}</span></h2></div>
            <button className="text-action" type="button" onClick={() => onNavigate("calendar")}>عرض التقويم <ArrowLeft size={14} /></button>
          </div>
          {loading ? <div className="loading-lines"><i /><i /><i /></div> : spotlight.length ? (
            <div className="today-list">
              {spotlight.map((task, index) => (
                <div className="today-item" key={task.id}>
                  <button className={`task-check ${task.status === "done" ? "checked" : ""}`} type="button" onClick={() => onStatusChange(task.id, task.status === "done" ? "todo" : "done")} aria-label={task.status === "done" ? `إعادة فتح ${task.title}` : `إكمال ${task.title}`}>
                    {task.status === "done" && <Check size={13} />}
                  </button>
                  <span className="today-item-copy"><strong>{task.title}</strong><span>{task.due_date ? `موعدها ${formatArabicDate(task.due_date)}` : task.category || "بلا موعد محدد"}</span></span>
                  <span className={`priority-dot priority-${task.priority}`} title={`أولوية ${PRIORITY_LABELS[task.priority]}`} />
                  {index === 0 && <span className="now-badge">ابدأ هنا</span>}
                  <button className="today-edit" type="button" onClick={() => onEdit(task)} aria-label={`تعديل ${task.title}`}><ArrowLeft size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="today-empty"><span className="empty-check"><CheckCircle2 size={20} /></span><strong>مساحة هادئة، يومك ملكك</strong><p>لا توجد مهام عاجلة الآن. أضف خطوة صغيرة لتبدأ.</p><button className="button button-soft button-small" type="button" onClick={onCreate}><Plus size={14} /> أضف مهمة لليوم</button></div>
          )}
          <div className="panel-footer-note"><CalendarDays size={14} /><span>{summary.due_today || 0} مهمة موعدها اليوم</span><span className="footer-note-separator">·</span><span>{summary.focus_sessions_today || 0} جلسة تركيز مكتملة</span></div>
        </section>

        <section className="panel next-step-panel">
          <div className="panel-heading">
            <div><span className="section-eyebrow">حرّك المشروع للأمام</span><h2>لوحة المهام</h2></div>
            <button className="panel-icon-button" type="button" onClick={() => onNavigate("board")} aria-label="فتح لوحة المهام"><ArrowUpLeft size={16} /></button>
          </div>
          <div className="mini-board">
            <div className="mini-board-row"><span className="mini-status status-pending"><i />بانتظار البدء</span><strong>{summary.todo || 0}</strong><span className="mini-bar"><i style={{ width: `${Math.min(100, summary.total ? summary.todo / summary.total * 100 : 0)}%` }} /></span></div>
            <div className="mini-board-row"><span className="mini-status status-progress"><i />قيد التنفيذ</span><strong>{summary.in_progress || 0}</strong><span className="mini-bar"><i style={{ width: `${Math.min(100, summary.total ? summary.in_progress / summary.total * 100 : 0)}%` }} /></span></div>
            <div className="mini-board-row"><span className="mini-status status-complete"><i />اكتملت</span><strong>{summary.completed || 0}</strong><span className="mini-bar"><i style={{ width: `${Math.min(100, summary.total ? summary.completed / summary.total * 100 : 0)}%` }} /></span></div>
          </div>
          <div className="mini-board-tip"><span className="tip-spark"><Sparkles size={15} /></span><span><strong>مساحة الإنجاز</strong><small>اسحب المهمة بين المراحل لتحديث حالتها.</small></span></div>
          <button className="button button-board-link" type="button" onClick={() => onNavigate("board")}>افتح لوحة Kanban <ArrowLeft size={15} /></button>
        </section>
      </div>

      <section className="bottom-cta-strip">
        <span className="bottom-cta-mark"><Sparkles size={17} /></span>
        <span className="bottom-cta-copy"><strong>التركيز لا يعني أن تعمل أكثر، بل أن تختار ما يستحق.</strong><small>خصص جلسة قصيرة لمهمة واحدة وشاهد أثرها.</small></span>
        <button type="button" className="button button-light" onClick={() => onNavigate("focus")}>جرّب وضع التركيز <ArrowLeft size={15} /></button>
      </section>
    </div>
  );
}
