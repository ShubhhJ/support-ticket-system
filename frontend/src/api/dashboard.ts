import { api } from './client';
import type { Stats } from '../types';

export async function getStats(): Promise<Stats> {
  const { data } = await api.get<{ data: Stats }>('/api/dashboard/stats');
  return data.data;
}
