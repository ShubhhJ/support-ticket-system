import { useEffect, useState } from 'react';
import { listAgents } from '../api/agents';
import { getErrorMessage } from '../api/client';
import type { Agent } from '../types';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listAgents()
      .then((data) => {
        if (active) setAgents(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { agents, loading, error };
}
