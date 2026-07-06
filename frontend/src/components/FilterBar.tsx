import { PRIORITIES, STATUSES, type Priority, type Status } from '../types';

interface FilterBarProps {
  status: Status | '';
  priority: Priority | '';
  search: string;
  onStatusChange: (value: Status | '') => void;
  onPriorityChange: (value: Priority | '') => void;
  onSearchChange: (value: string) => void;
}

const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function FilterBar({
  status,
  priority,
  search,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        className="input"
        placeholder="Search subject…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search by subject"
      />

      <select
        className="input"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as Status | '')}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as Priority | '')}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
