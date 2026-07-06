import { api } from './client';
import type { Comment, Paginated, Priority, Status, Ticket, TicketDetail } from '../types';

export interface ListTicketsParams {
  status?: Status;
  priority?: Priority;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listTickets(params: ListTicketsParams): Promise<Paginated<Ticket>> {
  const { data } = await api.get<Paginated<Ticket>>('/api/tickets', { params });
  return data;
}

export async function getTicket(id: number): Promise<TicketDetail> {
  const { data } = await api.get<{ data: TicketDetail }>(`/api/tickets/${id}`);
  return data.data;
}

export interface CreateTicketInput {
  subject: string;
  description?: string;
  priority: Priority;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const { data } = await api.post<{ data: Ticket }>('/api/tickets', input);
  return data.data;
}

export async function updateStatus(id: number, status: Status): Promise<Ticket> {
  const { data } = await api.patch<{ data: Ticket }>(`/api/tickets/${id}/status`, { status });
  return data.data;
}

export async function assignAgent(id: number, agentId: number): Promise<Ticket> {
  const { data } = await api.patch<{ data: Ticket }>(`/api/tickets/${id}/assign`, { agent_id: agentId });
  return data.data;
}

export async function addComment(id: number, author: string, message: string): Promise<Comment> {
  const { data } = await api.post<{ data: Comment }>(`/api/tickets/${id}/comments`, { author, message });
  return data.data;
}
