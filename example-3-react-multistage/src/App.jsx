import { useState } from "react";

const initialTasks = [
  { id: 1, title: "تعلّم أساسيات React", done: true },
  { id: 2, title: "إنشاء Dockerfile", done: false },
  { id: 3, title: "تشغيل الموقع داخل حاوية", done: false },
];

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    setTasks((current) => [
      ...current,
      { id: Date.now(), title, done: false },
    ]);
    setNewTask("");
  }

  const completedCount = tasks.filter((task) => task.done).length;

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand-mark">R</div>
        <span>React Practice</span>
        <span className="status"><i /> مشروع تجريبي</span>
      </header>

      <section className="hero">
        <p className="eyebrow">مشروع للتعلّم العملي</p>
        <h1>خطوة صغيرة،<br /><span>ومشروع يعمل.</span></h1>
        <p className="intro">
          تطبيق مهام بسيط مبني باستخدام React وVite، جاهز لتستخدمه في
          تمرينك القادم على Docker.
        </p>
        <div className="stats">
          <div className="stat">
            <strong>{tasks.length}</strong>
            <span>إجمالي المهام</span>
          </div>
          <div className="stat">
            <strong>{completedCount}</strong>
            <span>مهام مكتملة</span>
          </div>
          <div className="stat">
            <strong>{tasks.length - completedCount}</strong>
            <span>قيد التنفيذ</span>
          </div>
        </div>
      </section>

      <section className="task-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">قائمة اليوم</p>
            <h2>مهامي</h2>
          </div>
          <span className="task-count">{completedCount}/{tasks.length}</span>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="اكتب مهمة جديدة..."
            aria-label="مهمة جديدة"
          />
          <button type="submit">إضافة مهمة <span>＋</span></button>
        </form>

        <ul className="task-list">
          {tasks.map((task) => (
            <li className={task.done ? "task done" : "task"} key={task.id}>
              <button
                className="check"
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? "إلغاء إكمال المهمة" : "إكمال المهمة"}
              >
                {task.done ? "✓" : ""}
              </button>
              <span>{task.title}</span>
              <small>{task.done ? "مكتملة" : "قيد التنفيذ"}</small>
            </li>
          ))}
        </ul>
        <p className="hint">جرّب إضافة مهمة أو تغيير حالتها. التغييرات مؤقتة وتختفي عند إعادة تحميل الصفحة.</p>
      </section>

      <footer>
        <span>React + Vite</span>
        <span>مُعدّ للتدرب على Docker</span>
      </footer>
    </main>
  );
}