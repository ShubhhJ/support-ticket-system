import cron, { type ScheduledTask } from 'node-cron';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ACTIVE_STATUSES, type Priority } from '../types/index.js';
import { isBreached, isInWarningZone, nextPriority } from '../services/slaService.js';

let isRunning = false;

export async function runSlaEngine(now: Date = new Date()): Promise<void> {
  const tickets = await prisma.ticket.findMany({
    where: { status: { in: ACTIVE_STATUSES } },
    orderBy: { slaDueAt: 'asc' },
  });

  for (const ticket of tickets) {
    if (isInWarningZone(ticket.createdAt, ticket.slaDueAt, now)) {
      const warned = await prisma.slaEvent.count({
        where: { ticketId: ticket.id, eventType: 'warning' },
      });
      if (warned === 0) {
        await prisma.slaEvent.create({
          data: { ticketId: ticket.id, eventType: 'warning' },
        });
        logger.warn(`SLA WARNING: ticket #${ticket.id} "${ticket.subject}" — approaching SLA deadline`);
      }
    }

    if (isBreached(ticket.slaDueAt, now)) {
      const breached = await prisma.slaEvent.count({
        where: { ticketId: ticket.id, eventType: 'breached' },
      });
      if (breached === 0) {
        await escalateBreach(ticket.id, ticket.subject, ticket.priority as Priority, ticket.isEscalated);
      }
    }
  }
}

async function escalateBreach(
  id: number,
  subject: string,
  current: Priority,
  alreadyEscalated: boolean,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.slaEvent.create({ data: { ticketId: id, eventType: 'breached' } });

    if (alreadyEscalated) {
      logger.error(`SLA BREACH: ticket #${id} "${subject}" — breached (already escalated)`);
      return;
    }

    const next = nextPriority(current);
    await tx.ticket.update({ where: { id }, data: { priority: next, isEscalated: true } });
    await tx.slaEvent.create({ data: { ticketId: id, eventType: 'escalated' } });

    if (next === current) {
      logger.error(`SLA BREACH: ticket #${id} "${subject}" — escalated: already at max priority (urgent)`);
    } else {
      logger.error(`SLA BREACH: ticket #${id} "${subject}" — escalated ${current} → ${next}`);
    }
  });
}

async function tick(): Promise<void> {
  if (isRunning) {
    logger.warn('SLA engine still running from previous tick — skipping');
    return;
  }
  isRunning = true;
  try {
    await runSlaEngine();
  } catch (err) {
    logger.error('SLA engine run failed', { err });
  } finally {
    isRunning = false;
  }
}

export function registerSlaCron(): ScheduledTask {
  logger.info(`SLA cron scheduled: "${env.CRON_SCHEDULE}"`);
  void tick();
  return cron.schedule(env.CRON_SCHEDULE, () => {
    void tick();
  });
}
