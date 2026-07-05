import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as ticketService from '../services/ticketService.js';
import type {
  IdParam,
  CreateTicketInput,
  ListTicketsQuery,
  UpdateStatusInput,
  AssignAgentInput,
  AddCommentInput,
} from '../validators/ticketSchemas.js';

const getId = (req: Request): number => (req.valid!.params as IdParam).id;

export const create = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.createTicket(req.valid!.body as CreateTicketInput);
  res.status(201).json({ data: ticket });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await ticketService.listTickets(req.valid!.query as ListTicketsQuery);
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await ticketService.getTicketById(getId(req));
  res.json({ data: ticket });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.valid!.body as UpdateStatusInput;
  const ticket = await ticketService.updateStatus(getId(req), status);
  res.json({ data: ticket });
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const { agent_id } = req.valid!.body as AssignAgentInput;
  const ticket = await ticketService.assignAgent(getId(req), agent_id);
  res.json({ data: ticket });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { author, message } = req.valid!.body as AddCommentInput;
  const comment = await ticketService.addComment(getId(req), author, message);
  res.status(201).json({ data: comment });
});
