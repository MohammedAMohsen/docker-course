import { useMemo, useState } from "react";
import { CircleCheck, CircleDashed, Clock3, Plus, SlidersHorizontal, Sparkles } from "lucide-react";
import TaskCard from "./TaskCard.jsx";

const columns = [
  { id: "todo", title: "قيد الانتظار", hint: "جاهزة للبدء", icon: CircleDashed, tone: "pending" },
  { id: "in_progress", title: "قيد التنفيذ", hint: "تتقدم الآن", icon: Clock3, tone: "progress" },
  { id: "done", title: "مكتملة", hint: "أنجزتها", icon: CircleCheck, tone: "complete" },
];

export default function KanbanView({ tasks, loading, onEdit, onDelete, onStatusChange, onCreate }) {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dragOver, setDragOver] = useState("");
  const visibleTasks = useMemo(
    () => priorityFilter === "all" ? tasks : tasks.filter((task) => task.priority === priorityFilter),
    [tasks, priorityFilter],
  );

  function dropTask(event, status) {
    event.preventDefault();
    setDragOver("");
    const id = Number(event.dataTransfer.getData("text/plain"));
    const task = tasks.find((item) => item.id === id);
    if (task && task.status !== status) onStatusChange(id, status);
  }

  return (
    <div className="page-content board-page">
      <section className="page-intro board-intro">
        <div><span className="section-eyebrow"><Sparkles size={13} /> تدفّق العمل</span><h1>لوحة المهام</h1><p>شاهد العمل يتحرك. اسحب البطاقة بين الأعمدة لتحديث مرحلتها.</p></div>
        <div className="board-intro-actions"><label className="filter-select"><SlidersHorizontal size={15} /><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="تصفية حسب الأولوية"><option value="all">كل الأولويات</option><option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option></select></label><button className="button button-primary" type="button" onClick={() => onCreate({ status: "todo" })}><Plus size={16} /> مهمة جديدة</button></div>
      </section>
      <div className="board-summary-line"><span><i className="live-dot" /> {visibleTasks.length} مهمة في العرض</span><span className="drag-hint">يمكنك أيضاً تغيير الحالة من البطاقة</span></div>
      <section className="kanban-board" aria-label="لوحة المهام">
        {columns.map(({ id, title, hint, icon: Icon, tone }) => {
          const columnTasks = visibleTasks.filter((task) => task.status === id);
          return (
            <div
              key={id}
              className={`kanban-column column-${tone} ${dragOver === id ? "drop-active" : ""}`}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDragOver(id); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(""); }}
              onDrop={(event) => dropTask(event, id)}
            >
              <header className="kanban-column-header">
                <div className="column-title-wrap"><span className={`column-icon ${tone}`}><Icon size={16} /></span><span><strong>{title}</strong><small>{hint}</small></span></div>
                <span className="column-count">{columnTasks.length}</span>
              </header>
              <div className="kanban-cards">
                {loading ? <><div className="skeleton-card" /><div className="skeleton-card" /></> : columnTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} draggable />)}
                {!loading && columnTasks.length === 0 && <div className="column-empty"><span><Icon size={18} /></span><strong>لا توجد مهام هنا</strong><small>{id === "todo" ? "ابدأ بإضافة مهمة جديدة." : "اسحب مهمة إلى هذا العمود."}</small>{id === "todo" && <button type="button" onClick={() => onCreate({ status: id })}><Plus size={14} /> أضف مهمة</button>}</div>}
              </div>
              {!loading && id !== "done" && columnTasks.length > 0 && <button className="column-add" type="button" onClick={() => onCreate({ status: id })}><Plus size={15} /> أضف إلى {id === "todo" ? "قيد الانتظار" : "قيد التنفيذ"}</button>}
            </div>
          );
        })}
      </section>
      <div className="board-footer-note"><Sparkles size={14} /><span>تلميح: حدّد خطوة صغيرة، حرّكها إلى التنفيذ، ثم احتفل عند اكتمالها.</span></div>
    </div>
  );
}
