import { useMemo } from "react";
import { AlarmClock, ArrowLeft, Check, ChevronDown, CircleHelp, Clock3, Coffee, Flame, Play, RotateCcw, Sparkles } from "lucide-react";

const presets = [
  { minutes: 15, label: "سريع", hint: "دفعة قصيرة", icon: Coffee },
  { minutes: 25, label: "بومودورو", hint: "التركيز المتوازن", icon: Clock3 },
  { minutes: 50, label: "عميق", hint: "جلسة طويلة", icon: Flame },
];

function clock(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function FocusView({ tasks, summary, sessions, timer, selectedTaskId, onTaskChange, onDurationChange, onToggle, onReset, onNavigate }) {
  const openTasks = useMemo(() => tasks.filter((task) => task.status !== "done"), [tasks]);
  const selectedTask = openTasks.find((task) => String(task.id) === String(selectedTaskId));
  const sessionLocked = timer.running || Boolean(timer.sessionId);
  const totalSeconds = timer.durationMinutes * 60;
  const progress = Math.max(0, Math.min(100, ((totalSeconds - timer.secondsLeft) / totalSeconds) * 100));
  const todayMinutes = Number(summary.focus_minutes_today) || 0;
  const hours = Math.floor(todayMinutes / 60);
  const leftover = todayMinutes % 60;

  return (
    <div className="page-content focus-page">
      <section className="page-intro focus-intro">
        <div><span className="section-eyebrow"><Sparkles size={13} /> حضور كامل، خطوة واحدة</span><h1>مساحة التركيز</h1><p>اختر مهمة واحدة. أطفئ الضجيج. وابدأ الآن.</p></div>
        <div className="focus-today-total"><span className="focus-today-icon"><AlarmClock size={18} /></span><span><small>تركيزك اليوم</small><strong>{hours ? `${hours} س ` : ""}{leftover} د</strong></span></div>
      </section>

      <div className="focus-layout">
        <section className={`focus-stage ${timer.running ? "is-running" : ""}`}>
          <div className="focus-stage-orbit orbit-one" /><div className="focus-stage-orbit orbit-two" />
          <div className="focus-stage-heading"><span className="focus-status"><i />{timer.running ? "جلسة جارية" : timer.secondsLeft < totalSeconds ? "الجلسة متوقفة مؤقتاً" : "جاهز للبدء"}</span><span className="focus-stage-badge"><Sparkles size={13} /> ابقَ هنا</span></div>
          <div className="timer-shell" style={{ "--timer-progress": `${progress}%` }}>
            <div className="timer-inner"><span className="timer-overline">{timer.running ? "وقتك لك" : "خذ نفساً عميقاً"}</span><strong className="timer-digits" aria-live="polite">{clock(timer.secondsLeft)}</strong><span className="timer-caption">{timer.running ? "نحن نحرز تقدماً" : "كل شيء آخر يمكنه الانتظار"}</span></div>
          </div>
          <div className="focus-session-task"><span className="session-task-symbol"><Check size={17} /></span><span><small>مهمتك في هذه الجلسة</small><strong>{selectedTask?.title || "اختر مهمة للبدء"}</strong></span></div>
          <div className="timer-controls">
            <button className={`timer-main-button ${timer.running ? "pause" : ""}`} type="button" onClick={onToggle} disabled={!openTasks.length}>
              {timer.running ? <><span className="pause-glyph">Ⅱ</span> إيقاف مؤقت</> : <><Play size={17} fill="currentColor" /> {timer.secondsLeft < totalSeconds ? "استكمل الجلسة" : "ابدأ التركيز"}</>}
            </button>
            <button className="timer-reset-button" type="button" onClick={onReset} aria-label="إعادة ضبط المؤقت" title="إعادة ضبط"><RotateCcw size={17} /></button>
          </div>
          {!openTasks.length && <p className="focus-no-tasks">أضف مهمة غير مكتملة حتى تبدأ جلسة تركيز.</p>}
          {timer.saved && <div className="session-saved"><Check size={14} /> اكتملت الجلسة وسُجلت في سجلّك.</div>}
        </section>

        <aside className="focus-settings-column">
          <section className="panel focus-settings">
            <div className="focus-side-heading"><div><span className="section-eyebrow">إعداد الجلسة</span><h2>اضبط إيقاعك</h2></div><span className="settings-icon"><AlarmClock size={17} /></span></div>
            <label className="focus-select-label" htmlFor="focus-task-select">المهمة التي ستركز عليها</label>
            <div className="focus-select-wrap"><select id="focus-task-select" value={selectedTaskId || ""} onChange={(event) => onTaskChange(event.target.value)} disabled={sessionLocked}><option value="">اختر مهمة…</option>{openTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select><ChevronDown size={15} /></div>
            <div className="preset-heading"><span className="focus-select-label">مدة الجلسة</span><span className="preset-selected">{timer.durationMinutes} دقيقة</span></div>
            <div className="preset-options">{presets.map(({ minutes, label, hint, icon: Icon }) => <button key={minutes} className={`preset-card ${timer.durationMinutes === minutes ? "selected" : ""}`} type="button" onClick={() => onDurationChange(minutes)} disabled={sessionLocked}><span className="preset-icon"><Icon size={16} /></span><span className="preset-info"><strong>{label}</strong><small>{hint}</small></span><b>{minutes}<small>د</small></b></button>)}</div>
            <div className="focus-tip"><span><CircleHelp size={15} /></span><p>إذا بدأت الجلسة، اترك الإشعارات جانباً. الجلسة المكتملة تُحفظ تلقائياً في سجل تركيزك.</p></div>
          </section>

          <section className="panel focus-history">
            <div className="focus-side-heading"><div><span className="section-eyebrow">أحدث الإنجازات</span><h2>جلساتك الأخيرة</h2></div><span className="history-count">{sessions.length}</span></div>
            {sessions.length ? <div className="focus-history-list">{sessions.slice(0, 4).map((session) => <div className="history-row" key={session.id}><span className="history-check"><Check size={13} /></span><span className="history-name"><strong>{session.task_title}</strong><small>{new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit" }).format(new Date(session.completed_at))}</small></span><b>{session.duration_minutes} د</b></div>)}</div> : <div className="history-empty"><span><Clock3 size={17} /></span><p>أكمل أول جلسة، وستظهر هنا.</p></div>}
            <button className="text-action history-link" type="button" onClick={() => onNavigate("overview")}>العودة إلى مساحة العمل <ArrowLeft size={14} /></button>
          </section>
        </aside>
      </div>
    </div>
  );
}
