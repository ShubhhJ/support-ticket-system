import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { VALID_TRANSITIONS, type Priority, type Status } from '../types/index.js';
import { computeDueAt } from './slaService.js';
import type { ListTicketsQuery } from '../validators/ticketSchemas.js';

interface CreateTicketInput {
  subject: string;
  description?: string;
  priority: Priority;
}

const agentSummary = { select: { id: true, name: true, email: true } };

export async function createTicket(input: CreateTicketInput) {
  const createdAt = new Date();
  return prisma.ticket.create({
    data: {
      subject: input.subject,
      description: input.description ?? null,
      priority: input.priority,
      createdAt,
      slaDueAt: computeDueAt(createdAt, input.priority),
    },
  });
}

export async function listTickets(query: ListTicketsQuery) {
  const { status, priority, search, page, limit } = query;

  const where: Prisma.TicketWhereInput = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(search ? { subject: { contains: search } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { agent: agentSummary },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getTicketById(id: number) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      agent: agentSummary,
      comments: { orderBy: { createdAt: 'asc' } },
      slaEvents: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!ticket) throw new AppError(404, `Ticket ${id} not found`);
  return ticket;
}

export async function updateStatus(id: number, next: Status) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new AppError(404, `Ticket ${id} not found`);

  const allowed = VALID_TRANSITIONS[ticket.status as Status];
  if (!allowed.includes(next)) {
    throw new AppError(
      422,
      `Invalid status transition: ${ticket.status} -> ${next}`,
      { from: ticket.status, allowed },
    );
  }

  return prisma.ticket.update({ where: { id }, data: { status: next } });
}

export async function assignAgent(id: number, agentId: number) {
  const [ticket, agent] = await Promise.all([
    prisma.ticket.findUnique({ where: { id } }),
    prisma.agent.findUnique({ where: { id: agentId } }),
  ]);

  if (!ticket) throw new AppError(404, `Ticket ${id} not found`);
  if (!agent) throw new AppError(404, `Agent ${agentId} not found`);

  return prisma.ticket.update({
    where: { id },
    data: { assignedAgentId: agentId },
    include: { agent: agentSummary },
  });
}

export async function addComment(ticketId: number, author: string, message: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError(404, `Ticket ${ticketId} not found`);

  return prisma.ticketComment.create({ data: { ticketId, author, message } });
}
