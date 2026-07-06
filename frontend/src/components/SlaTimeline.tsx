import type { EventType, SlaEvent } from '../types';
import { formatDateTime } from '../lib/sla';

const EVENT_META: Record<EventType, { icon: string; label: string }> = {
  warning: { icon: '⚠', label: 'Warning — approaching SLA deadline' },
  breached: { icon: '⛔', label: 'Breached — SLA deadline passed' },
  escalated: { icon: '▲', label: 'Escalated — priority bumped' },
};

export function SlaTimeline({ events }: { events: SlaEvent[] }) {
  if (events.length === 0) {
    return <p className="muted">No SLA events yet.</p>;
  }

  return (
    <ul className="timeline">
      {events.map((event) => {
        const meta = EVENT_META[event.eventType];
        return (
          <li key={event.id} className={`timeline-item event-${event.eventType}`}>
            <span className="timeline-icon" aria-hidden="true">
              {meta.icon}
            </span>
            <div>
              <div className="timeline-label">{meta.label}</div>
              <div className="muted small">{formatDateTime(event.createdAt)}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
