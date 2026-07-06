import { useCallback, useEffect, useState } from 'react';
import { getTicket } from '../api/tickets';
import { getErrorMessage } from '../api/client';
import type { TicketDetail } from '../types';

export function useTicket(id: number) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTicket(await getTicket(id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, loading, error, refetch: fetchTicket };
}
