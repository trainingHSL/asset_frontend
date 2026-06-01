const icons = {
  'Total Users': 'US',
  'Total Assets': 'AS',
  Assigned: '↔',
  Available: '✓',
  'Material Items': 'MT',
  'Issued Material': 'IM',
  'Issue Records': '#',
  Returns: '↩',
  'Low Stock': '!',
};

export default function StatCard({ label, value, note }) {
  return (
    <div className="stat-card glass">
      <div className="stat-head">
        <span>{label}</span>
        <div className="stat-icon">{icons[label] || '◇'}</div>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
