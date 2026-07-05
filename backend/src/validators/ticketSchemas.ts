import { z } from 'zod';
import { PRIORITIES, STATUSES } from '../types/index.js';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createTicketSchema = z.object({
  subject: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  priority: z.enum(PRIORITIES),
});

export const listTicketsQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES),
});

export const assignAgentSchema = z.object({
  agent_id: z.coerce.number().int().positive(),
});

export const addCommentSchema = z.object({
  author: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(5000),
});

export type IdParam = z.infer<typeof idParamSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignAgentInput = z.infer<typeof assignAgentSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
