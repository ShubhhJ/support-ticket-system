export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export type Status = (typeof STATUSES)[number];

export const EVENT_TYPES = ['warning', 'breached', 'escalated'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const ACTIVE_STATUSES: Status[] = ['open', 'in_progress'];

export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  open: ['in_progress', 'closed'],
  in_progress: ['resolved', 'open'],
  resolved: ['closed'],
  closed: [],
};
