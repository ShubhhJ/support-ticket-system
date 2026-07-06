import { useEffect, useState } from 'react';
import type { Priority, Status } from '../types';
import { useTickets } from '../hooks/useTickets';
import { useDebounce } from '../hooks/useDebounce';
import { FilterBar } from '../components/FilterBar';
import { TicketTable } from '../components/TicketTable';
import { Pagination } from '../components/Pagination';
import { NewTicketForm } from '../components/NewTicketForm';
import { Loader } from '../components/shared/Loader';
import { ErrorMessage } from '../components/shared/ErrorMessage';

const LIMIT = 10;

export function TicketsPage() {
  const [status, setStatus] = useState<Status | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [status, priority, debouncedSearch]);

  const { data, loading, error, refetch } = useTickets({
    status: status || undefined,
    priority: priority || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: LIMIT,
  });

  return (
    <div className="page">
      <div className="page-head">
        <h1>Tickets</h1>
        <NewTicketForm onCreated={refetch} />
      </div>

      <FilterBar
        status={status}
        priority={priority}
        search={search}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSearchChange={setSearch}
      />

      {loading && <Loader />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!error && data && (
        <>
          <TicketTable tickets={data.data} />
          <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
