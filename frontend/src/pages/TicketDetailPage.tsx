import { Link, useParams } from 'react-router-dom';
import { useTicket } from '../hooks/useTicket';
import { formatDateTime, formatDueLabel } from '../lib/sla';
import { PriorityBadge } from '../components/shared/PriorityBadge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SlaBadge } from '../components/shared/SlaBadge';
import { SlaTimeline } from '../components/SlaTimeline';
import { CommentThread } from '../components/CommentThread';
import { TicketActions } from '../components/TicketActions';
import { Loader } from '../components/shared/Loader';
import { ErrorMessage } from '../components/shared/ErrorMessage';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { ticket, loading, error, refetch } = useTicket(ticketId);

  return (
    <div className="page">
      <Link to="/tickets" className="back-link">
        ← Back to tickets
      </Link>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && ticket && (
        <>
          <div className="detail-header">
            <div>
              <h1>
                #{ticket.id} {ticket.subject}
              </h1>
              <div className="badge-row">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <SlaBadge ticket={ticket} />
                {ticket.isEscalated && <span className="badge sla-breached">Escalated</span>}
              </div>
            </div>
          </div>

          <div className="detail-meta">
            <div>
              <span className="muted small">Assigned to</span>
              <div>{ticket.agent ? ticket.agent.name : <span className="muted">Unassigned</span>}</div>
            </div>
            <div>
              <span className="muted small">SLA due</span>
              <div>
                {formatDateTime(ticket.slaDueAt)} <span className="muted">({formatDueLabel(ticket)})</span>
              </div>
            </div>
            <div>
              <span className="muted small">Created</span>
              <div>{formatDateTime(ticket.createdAt)}</div>
            </div>
          </div>

          {ticket.description && <p className="detail-description">{ticket.description}</p>}

          <div className="detail-grid">
            <section className="panel">
              <h2>Actions</h2>
              <TicketActions ticket={ticket} onUpdated={refetch} />
            </section>

            <section className="panel">
              <h2>SLA timeline</h2>
              <SlaTimeline events={ticket.slaEvents} />
            </section>
          </div>

          <section className="panel">
            <h2>Conversation</h2>
            <CommentThread ticketId={ticket.id} comments={ticket.comments} onAdded={refetch} />
          </section>
        </>
      )}
    </div>
  );
}
