import {
  CalendarDays,
  CheckSquare2,
  ChevronLeft,
  CircleDashed,
  Clock3,
  LayoutDashboard,
  Layers3,
  Sparkles,
} from "lucide-react";

const navigation = [
  { key: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { key: "board", label: "لوحة المهام", icon: Layers3 },
  { key: "calendar", label: "التقويم", icon: CalendarDays },
  { key: "focus", label: "جلسة تركيز", icon: Clock3 },
];

export default function Sidebar({ active, onSelect, connected, onCreate }) {
  return (
    <aside className="sidebar">
      <a className="brand-lockup" href="#overview" onClick={(event) => { event.preventDefault(); onSelect("overview"); }} aria-label="نواة — نظرة عامة">
        <span className="brand-symbol"><CheckSquare2 size={21} strokeWidth={2.3} /></span>
        <span className="brand-copy"><strong>نواة</strong><span>مساحة العمل</span></span>
      </a>

      <div className="sidebar-label">مساحتك</div>
      <nav className="side-nav" aria-label="التنقل الرئيسي">
        {navigation.map(({ key, label, icon: Icon }) => (
          <button
            type="button"
            key={key}
            className={`nav-item ${active === key ? "active" : ""}`}
            onClick={() => onSelect(key)}
            aria-current={active === key ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
            {active === key && <ChevronLeft className="nav-chevron" size={15} aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />
      <button className="sidebar-create" type="button" onClick={onCreate}>
        <span><span className="create-plus">+</span><span>مهمة جديدة</span></span>
        <kbd>N</kbd>
      </button>
      <div className="sidebar-tip">
        <span className="tip-icon"><Sparkles size={16} /></span>
        <div><strong>مساحة للتقدّم</strong><p>قليل من التركيز يصنع فرقاً كبيراً.</p></div>
      </div>
      <div className="sidebar-profile">
        <span className="profile-avatar">ن</span>
        <span className="profile-copy"><strong>مساحة التعلّم</strong><span>مشروعك التجريبي</span></span>
        <span className={`connection-dot ${connected ? "is-online" : ""}`} title={connected ? "الخادم متصل" : "الخادم غير متصل"} />
      </div>
    </aside>
  );
}
