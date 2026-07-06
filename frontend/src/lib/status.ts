import type { Status } from '../types';

export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  open: ['in_progress', 'closed'],
  in_progress: ['resolved', 'open'],
  resolved: ['closed'],
  closed: [],
};

export const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};
