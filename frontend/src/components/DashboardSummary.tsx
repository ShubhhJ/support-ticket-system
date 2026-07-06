import type { Stats } from '../types';

const STATUS_ORDER: { key: keyof Stats['byStatus']; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export function DashboardSummary({ stats }: { stats: Stats }) {
  return (
    <div className="dashboard">
      <div className="card-grid">
        {STATUS_ORDER.map(({ key, label }) => (
          <div key={key} className="stat-card">
            <div className="stat-value">{stats.byStatus[key] ?? 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card-grid">
        <div className={`stat-card alert ${stats.breached > 0 ? 'danger' : ''}`}>
          <div className="stat-value">{stats.breached}</div>
          <div className="stat-label">Breached (SLA overdue)</div>
        </div>
        <div className={`stat-card alert ${stats.atRisk > 0 ? 'warn' : ''}`}>
          <div className="stat-value">{stats.atRisk}</div>
          <div className="stat-label">At risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total tickets</div>
        </div>
      </div>
    </div>
  );
}
