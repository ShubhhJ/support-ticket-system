import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Ticket } from '../types';

dayjs.extend(relativeTime);

export type SlaState = 'resolved' | 'breached' | 'at-risk' | 'ok';

const WARNING_THRESHOLD = 0.2;

export function getSlaState(ticket: Ticket): SlaState {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return 'resolved';

  const due = dayjs(ticket.slaDueAt);
  const created = dayjs(ticket.createdAt);
  const now = dayjs();

  const windowMs = due.diff(created);
  const remainingMs = due.diff(now);

  if (remainingMs < 0) return 'breached';
  if (remainingMs < windowMs * WARNING_THRESHOLD) return 'at-risk';
  return 'ok';
}

export const SLA_STATE_LABELS: Record<SlaState, string> = {
  resolved: 'Resolved',
  breached: 'Breached',
  'at-risk': 'At risk',
  ok: 'On track',
};

export function formatDueLabel(ticket: Ticket): string {
  const due = dayjs(ticket.slaDueAt);
  const state = getSlaState(ticket);
  if (state === 'breached') return `Overdue ${due.fromNow()}`;
  if (state === 'resolved') return due.format('MMM D, HH:mm');
  return `Due ${due.fromNow()}`;
}

export function formatDateTime(value: string): string {
  return dayjs(value).format('MMM D, YYYY HH:mm');
}
