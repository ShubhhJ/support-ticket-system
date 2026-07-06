import type { Ticket } from '../types';
import { TicketRow } from './TicketRow';

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return <p className="muted empty-state">No tickets match your filters.</p>;
  }

  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Subject</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Agent</th>
          <th>SLA</th>
          <th>Due</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
      </tbody>
    </table>
  );
}
