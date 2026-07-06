import { useNavigate } from 'react-router-dom';
import type { Ticket } from '../types';
import { getSlaState, formatDueLabel } from '../lib/sla';
import { PriorityBadge } from './shared/PriorityBadge';
import { StatusBadge } from './shared/StatusBadge';
import { SlaBadge } from './shared/SlaBadge';

export function TicketRow({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const slaState = getSlaState(ticket);

  return (
    <tr className={`row-sla-${slaState}`} onClick={() => navigate(`/tickets/${ticket.id}`)}>
      <td>#{ticket.id}</td>
      <td className="subject-cell">
        {ticket.subject}
        {ticket.isEscalated && <span className="escalated-tag" title="Escalated">▲ escalated</span>}
      </td>
      <td>
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td>
        <StatusBadge status={ticket.status} />
      </td>
      <td>{ticket.agent ? ticket.agent.name : <span className="muted">Unassigned</span>}</td>
      <td>
        <SlaBadge ticket={ticket} />
      </td>
      <td className="muted">{formatDueLabel(ticket)}</td>
    </tr>
  );
}
