import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckSquare2, Moon, Plus, Search, Sun, X } from "lucide-react";
import {
  createFocusSession,
  createTask,
  deleteTask,
  getAllTasks,
  getCalendarTasks,
  getFocusSessions,
  getSummary,
  updateTask,
} from "./api.js";
import CalendarView, { localDateKey, monthKey } from "./components/CalendarView.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import DashboardView from "./components/DashboardView.jsx";
import FocusView from "./components/FocusView.jsx";
import KanbanView from "./components/KanbanView.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TaskModal from "./components/TaskModal.jsx";
import Toast from "./components/Toast.jsx";
import { isOverdue } from "./formatters.js";

const defaultSummary = {
  total: 0, todo: 0, in_progress: 0, completed: 0, overdue: 0,
  due_today: 0, completion_rate: 0, focus_minutes_today: 0, focus_sessions_today: 0,
};
const pageMeta = {
  overview: { title: "نظرة عامة", eyebrow: "مساحة العمل" },
  board: { title: "لوحة المهام", eyebrow: "إدارة العمل" },
  calendar: { title: "التقويم", eyebrow: "التخطيط" },
  focus: { title: "مساحة التركيز", eyebrow: "جلسة شخصية" },
};
const themeKey = "nawa-remastered-theme";

function initialTheme() {
  try {
    const value = localStorage.getItem(themeKey);
    if (value === "light" || value === "dark") return value;
  } catch { /* Browser storage may be disabled. */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function initialPage() {
  const requested = window.location.hash.replace("#", "");
  return Object.hasOwn(pageMeta, requested) ? requested : "overview";
}

export default function App() {
  const [page, setPage] = useState(initialPage);
  const [theme, setTheme] = useState(initialTheme);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [focusSessions, setFocusSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [initialTaskValues, setInitialTaskValues] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(monthKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(localDateKey(new Date()));
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState("");
  const [timer, setTimer] = useState({ durationMinutes: 25, secondsLeft: 25 * 60, running: false, sessionId: null, taskId: null, saved: false });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef(null);
  const completedSessionIds = useRef(new Set());
  const currentCalendarKey = useRef("");

  const loadWorkspace = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setLoadError("");
    try {
      const [taskRows, summaryData, sessions] = await Promise.all([
        getAllTasks(),
        getSummary(),
        getFocusSessions(),
      ]);
      setTasks(taskRows);
      setSummary({ ...defaultSummary, ...summaryData });
      setFocusSessions(sessions || []);
      setConnected(true);
    } catch (error) {
      setLoadError(error.message || "تعذر تحميل مساحة العمل.");
      setConnected(false);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#11121b" : "#f5f4f8");
    try { localStorage.setItem(themeKey, theme); } catch { /* Keep this choice for the current visit. */ }
  }, [theme]);

  useEffect(() => {
    const syncPageFromHash = () => {
      const requested = window.location.hash.replace("#", "");
      if (Object.hasOwn(pageMeta, requested)) setPage(requested);
    };
    window.addEventListener("popstate", syncPageFromHash);
    window.addEventListener("hashchange", syncPageFromHash);
    return () => {
      window.removeEventListener("popstate", syncPageFromHash);
      window.removeEventListener("hashchange", syncPageFromHash);
    };
  }, []);

  useEffect(() => {
    if (page !== "calendar") return undefined;
    const key = calendarMonth;
    currentCalendarKey.current = key;
    setCalendarLoading(true);
    setCalendarError("");
    getCalendarTasks(key)
      .then((response) => { if (currentCalendarKey.current === key) setCalendarTasks(response.results || []); })
      .catch((error) => { if (currentCalendarKey.current === key) setCalendarError(error.message || "تعذر تحميل مواعيد الشهر."); })
      .finally(() => { if (currentCalendarKey.current === key) setCalendarLoading(false); });
    return () => { if (currentCalendarKey.current === key) currentCalendarKey.current = ""; };
  }, [calendarMonth, page, calendarRefresh]);

  useEffect(() => {
    if (!timer.running) return undefined;
    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (current.secondsLeft <= 1) return { ...current, secondsLeft: 0, running: false };
        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timer.running]);

  useEffect(() => {
    const sessionId = timer.sessionId;
    if (!sessionId || timer.running || timer.secondsLeft !== 0 || completedSessionIds.current.has(sessionId)) return;
    completedSessionIds.current.add(sessionId);
    createFocusSession({ task_id: timer.taskId, duration_minutes: timer.durationMinutes })
      .then(async () => {
        setTimer((current) => ({ ...current, saved: true }));
        await loadWorkspace({ quiet: true });
        setToast({ type: "success", message: "اكتملت جلسة التركيز وحُفظت في سجلّك." });
      })
      .catch((error) => setToast({ type: "error", message: error.message || "انتهى المؤقت لكن تعذّر حفظ الجلسة." }));
  }, [timer.sessionId, timer.running, timer.secondsLeft, timer.taskId, timer.durationMinutes, loadWorkspace]);

  useEffect(() => {
    if (!selectedFocusTaskId) {
      const firstTask = tasks.find((task) => task.status !== "done");
      if (firstTask) setSelectedFocusTaskId(String(firstTask.id));
    }
  }, [tasks, selectedFocusTaskId]);

  const openCreate = useCallback((values = {}) => {
    setEditingTask(null);
    setInitialTaskValues(values);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (!isTyping && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCreate();
      } else if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [openCreate]);

  const filteredTasks = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ar");
    if (!needle) return tasks;
    return tasks.filter((task) => [task.title, task.description, task.category].some((value) => value?.toLocaleLowerCase("ar").includes(needle)));
  }, [tasks, query]);
  const overdueTasks = useMemo(() => tasks.filter(isOverdue).slice(0, 5), [tasks]);

  function openEdit(task) {
    setEditingTask(task);
    setInitialTaskValues(null);
    setModalOpen(true);
  }

  function navigateTo(nextPage) {
    if (!Object.hasOwn(pageMeta, nextPage)) return;
    setPage(nextPage);
    if (window.location.hash !== `#${nextPage}`) {
      window.history.pushState({ page: nextPage }, "", `#${nextPage}`);
    }
  }

  function closeModal() {
    if (!saving) setModalOpen(false);
  }

  async function saveTask(values) {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        setToast({ type: "success", message: "حُفظت تعديلات المهمة." });
      } else {
        await createTask(values);
        setToast({ type: "success", message: "أُضيفت المهمة إلى مساحة العمل." });
      }
      setModalOpen(false);
      await loadWorkspace({ quiet: true });
      if (page === "calendar") {
        const response = await getCalendarTasks(calendarMonth);
        setCalendarTasks(response.results || []);
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id, nextStatus) {
    const before = tasks;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: nextStatus } : task));
    try {
      await updateTask(id, { status: nextStatus });
      await loadWorkspace({ quiet: true });
    } catch (error) {
      setTasks(before);
      setToast({ type: "error", message: error.message || "تعذر تحديث حالة المهمة." });
    }
  }

  async function confirmDelete() {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setToast({ type: "success", message: "حُذفت المهمة." });
      await loadWorkspace({ quiet: true });
      if (page === "calendar") {
        const response = await getCalendarTasks(calendarMonth);
        setCalendarTasks(response.results || []);
      }
    } catch (error) {
      setToast({ type: "error", message: error.message || "تعذر حذف المهمة." });
    } finally {
      setDeleting(false);
    }
  }

  function handleMonthChange(nextMonth, nextDate) {
    setCalendarMonth(nextMonth);
    setSelectedDate(nextDate);
  }

  function toggleTimer() {
    if (!timer.running && !timer.sessionId && !selectedFocusTaskId) {
      setToast({ type: "error", message: "اختر مهمة قبل بدء جلسة التركيز." });
      return;
    }
    if (!timer.running && timer.secondsLeft === 0) return;
    setTimer((current) => ({
      ...current,
      running: !current.running,
      saved: false,
      sessionId: current.sessionId || `focus-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      taskId: current.taskId || Number(selectedFocusTaskId),
    }));
  }

  function resetTimer() {
    setTimer((current) => ({ durationMinutes: current.durationMinutes, secondsLeft: current.durationMinutes * 60, running: false, sessionId: null, taskId: null, saved: false }));
  }

  function setFocusDuration(minutes) {
    setTimer({ durationMinutes: minutes, secondsLeft: minutes * 60, running: false, sessionId: null, taskId: null, saved: false });
  }

  const activePage = pageMeta[page] || pageMeta.overview;
  const dateLine = new Intl.DateTimeFormat("ar", { day: "numeric", month: "short", weekday: "short" }).format(new Date());

  return (
    <div className="app-shell" dir="rtl">
      <Sidebar active={page} onSelect={navigateTo} connected={connected} onCreate={() => openCreate()} />
      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-route"><span>{activePage.eyebrow}</span><span className="route-slash">/</span><strong>{activePage.title}</strong></div>
          <div className="topbar-tools">
            <label className="global-search"><Search size={16} /><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن مهمة…" aria-label="ابحث في المهام" /><kbd>⌘ K</kbd></label>
            <span className="topbar-date">{dateLine}</span>
            <span className={`connection-pill ${connected ? "connected" : ""}`}><i />{connected ? "متصل" : "غير متصل"}</span>
            <div className="notification-wrap">
              <button className={`topbar-icon-button ${notificationsOpen ? "active" : ""}`} type="button" onClick={() => setNotificationsOpen((value) => !value)} aria-label={`التنبيهات، ${overdueTasks.length} مهام متأخرة`} aria-expanded={notificationsOpen}><Bell size={17} />{overdueTasks.length > 0 && <i className="notification-count">{overdueTasks.length}</i>}</button>
              {notificationsOpen && <div className="notification-popover"><div className="notification-heading"><strong>تحتاج انتباهك</strong><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="إغلاق"><X size={15} /></button></div>{overdueTasks.length ? overdueTasks.map((task) => <button className="notification-item" key={task.id} type="button" onClick={() => { openEdit(task); setNotificationsOpen(false); }}><span className="notification-dot" /><span><strong>{task.title}</strong><small>مهمة متأخرة</small></span></button>) : <div className="notification-empty">لا توجد تنبيهات حالياً.</div>}</div>}
            </div>
            <button className="theme-toggle" type="button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"} title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="topbar-create" type="button" onClick={() => openCreate()}><Plus size={16} /><span>مهمة</span></button>
          </div>
        </header>

        {loadError && <div className="global-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => loadWorkspace()}>إعادة المحاولة</button></div>}
        {calendarError && page === "calendar" && <div className="global-error" role="alert"><span>{calendarError}</span><button type="button" onClick={() => setCalendarRefresh((value) => value + 1)}>إعادة المحاولة</button></div>}

        {page === "overview" && <DashboardView summary={summary} tasks={filteredTasks} loading={loading} onCreate={() => openCreate()} onEdit={openEdit} onDelete={setTaskToDelete} onStatusChange={changeStatus} onNavigate={navigateTo} />}
        {page === "board" && <KanbanView tasks={filteredTasks} loading={loading} onEdit={openEdit} onDelete={setTaskToDelete} onStatusChange={changeStatus} onCreate={openCreate} />}
        {page === "calendar" && <CalendarView month={calendarMonth} tasks={calendarTasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} loading={calendarLoading} onMonthChange={handleMonthChange} onCreate={openCreate} onEdit={openEdit} />}
        {page === "focus" && <FocusView tasks={tasks} summary={summary} sessions={focusSessions} timer={timer} selectedTaskId={selectedFocusTaskId} onTaskChange={setSelectedFocusTaskId} onDurationChange={setFocusDuration} onToggle={toggleTimer} onReset={resetTimer} onNavigate={navigateTo} />}

        <footer className="app-footer"><span><CheckSquare2 size={13} /> نواة <i>·</i> مساحة للتقدّم</span><span>كل خطوة صغيرة تصنع فرقاً.</span></footer>
      </main>

      {modalOpen && <TaskModal key={editingTask?.id || `new-${JSON.stringify(initialTaskValues)}`} task={editingTask} initialValues={initialTaskValues} onClose={closeModal} onSubmit={saveTask} saving={saving} />}
      <ConfirmDialog task={taskToDelete} onCancel={() => !deleting && setTaskToDelete(null)} onConfirm={confirmDelete} deleting={deleting} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
