import { useState } from 'react';
import type { Status, TicketDetail } from '../types';
import { assignAgent, updateStatus } from '../api/tickets';
import { getErrorMessage } from '../api/client';
import { useAgents } from '../hooks/useAgents';
import { STATUS_LABELS, VALID_TRANSITIONS } from '../lib/status';

interface TicketActionsProps {
  ticket: TicketDetail;
  onUpdated: () => void;
}

export function TicketActions({ ticket, onUpdated }: TicketActionsProps) {
  const { agents } = useAgents();
  const nextStatuses = VALID_TRANSITIONS[ticket.status];

  const [status, setStatus] = useState<Status | ''>('');
  const [agentId, setAgentId] = useState<string>(ticket.assignedAgentId ? String(ticket.assignedAgentId) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onUpdated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="actions-panel">
      <div className="action-group">
        <label>Change status</label>
        {nextStatuses.length === 0 ? (
          <p className="muted small">This ticket is closed — no further transitions.</p>
        ) : (
          <div className="action-row">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Status | '')}>
              <option value="">Select…</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              disabled={busy || !status}
              onClick={() => status && run(() => updateStatus(ticket.id, status))}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="action-group">
        <label>Assign agent</label>
        <div className="action-row">
          <select className="input" value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">Select agent…</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            disabled={busy || !agentId}
            onClick={() => agentId && run(() => assignAgent(ticket.id, Number(agentId)))}
          >
            Assign
          </button>
        </div>
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
