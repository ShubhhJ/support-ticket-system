import { api } from './client';
import type { Agent } from '../types';

export async function listAgents(): Promise<Agent[]> {
  const { data } = await api.get<{ data: Agent[] }>('/api/agents');
  return data.data;
}
