interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-small"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>
      <span>
        Page {page} of {totalPages} · {total} tickets
      </span>
      <button
        type="button"
        className="btn btn-small"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
