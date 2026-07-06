import type { Ticket } from '../../types';
import { getSlaState, SLA_STATE_LABELS } from '../../lib/sla';

export function SlaBadge({ ticket }: { ticket: Ticket }) {
  const state = getSlaState(ticket);
  return <span className={`badge sla-${state}`}>{SLA_STATE_LABELS[state]}</span>;
}
