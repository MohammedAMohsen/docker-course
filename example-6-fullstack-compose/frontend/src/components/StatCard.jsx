export default function StatCard({ icon: Icon, label, value, note, tone = "indigo" }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-topline">
        <span className="stat-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
        <span className="stat-note">{note}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </article>
  );
}
