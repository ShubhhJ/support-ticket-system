import dayjs from 'dayjs';
import { env } from '../config/env.js';
import { PRIORITIES, type Priority } from '../types/index.js';

function getSlaHours(priority: Priority): number {
  switch (priority) {
    case 'urgent':
      return env.SLA_URGENT_HOURS;
    case 'high':
      return env.SLA_HIGH_HOURS;
    case 'medium':
      return env.SLA_MEDIUM_HOURS;
    case 'low':
      return env.SLA_LOW_HOURS;
  }
}

export function computeDueAt(createdAt: Date, priority: Priority): Date {
  return dayjs(createdAt).add(getSlaHours(priority), 'hour').toDate();
}

export function nextPriority(priority: Priority): Priority {
  const idx = PRIORITIES.indexOf(priority);
  return idx < PRIORITIES.length - 1 ? PRIORITIES[idx + 1]! : 'urgent';
}

export function isBreached(slaDueAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > slaDueAt.getTime();
}

export function isInWarningZone(
  createdAt: Date,
  slaDueAt: Date,
  now: Date = new Date(),
): boolean {
  const windowMs = slaDueAt.getTime() - createdAt.getTime();
  const remainingMs = slaDueAt.getTime() - now.getTime();
  return remainingMs > 0 && remainingMs <= windowMs * env.SLA_WARNING_THRESHOLD;
}
