export default function StatCard({ label, value, note }) {
  return (
    <div className="stat-card glass">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
