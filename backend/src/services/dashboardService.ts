import { prisma } from '../config/prisma.js';
import { ACTIVE_STATUSES, PRIORITIES, STATUSES, type Priority, type Status } from '../types/index.js';
import { isBreached, isInWarningZone } from './slaService.js';

export async function getStats() {
  const now = new Date();

  const [statusGroups, priorityGroups, breached, activeTickets, total] = await Promise.all([
    prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ['priority'], _count: { _all: true } }),
    prisma.ticket.count({
      where: { status: { in: ACTIVE_STATUSES }, slaDueAt: { lt: now } },
    }),
    prisma.ticket.findMany({
      where: { status: { in: ACTIVE_STATUSES } },
      select: { createdAt: true, slaDueAt: true },
    }),
    prisma.ticket.count(),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const row of statusGroups) byStatus[row.status as Status] = row._count._all;

  const byPriority = Object.fromEntries(PRIORITIES.map((p) => [p, 0])) as Record<Priority, number>;
  for (const row of priorityGroups) byPriority[row.priority as Priority] = row._count._all;

  const atRisk = activeTickets.filter(
    (t) => !isBreached(t.slaDueAt, now) && isInWarningZone(t.createdAt, t.slaDueAt, now),
  ).length;

  return { total, byStatus, byPriority, breached, atRisk };
}
