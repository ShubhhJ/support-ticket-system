import { useCallback, useEffect, useState } from 'react';
import { listTickets, type ListTicketsParams } from '../api/tickets';
import { getErrorMessage } from '../api/client';
import type { Paginated, Ticket } from '../types';

export function useTickets(params: ListTicketsParams) {
  const [data, setData] = useState<Paginated<Ticket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status, priority, search, page, limit } = params;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTickets({ status, priority, search, page, limit });
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, priority, search, page, limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { data, loading, error, refetch: fetchTickets };
}
