export function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}
