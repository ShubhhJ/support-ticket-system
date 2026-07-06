export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';
export type EventType = 'warning' | 'breached' | 'escalated';

export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
export const STATUSES: Status[] = ['open', 'in_progress', 'resolved', 'closed'];

export interface AgentSummary {
  id: number;
  name: string;
  email: string;
}

export interface Agent extends AgentSummary {
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string | null;
  priority: Priority;
  status: Status;
  assignedAgentId: number | null;
  slaDueAt: string;
  isEscalated: boolean;
  createdAt: string;
  updatedAt: string;
  agent?: AgentSummary | null;
}

export interface Comment {
  id: number;
  ticketId: number;
  author: string;
  message: string;
  createdAt: string;
}

export interface SlaEvent {
  id: number;
  ticketId: number;
  eventType: EventType;
  createdAt: string;
}

export interface TicketDetail extends Ticket {
  comments: Comment[];
  slaEvents: SlaEvent[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Stats {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  breached: number;
  atRisk: number;
}
