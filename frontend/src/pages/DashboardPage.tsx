import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardSummary } from '../components/DashboardSummary';
import { Loader } from '../components/shared/Loader';
import { ErrorMessage } from '../components/shared/ErrorMessage';

export function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboard();

  return (
    <div className="page">
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link to="/tickets" className="btn btn-primary">
          View all tickets →
        </Link>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} onRetry={refetch} />}
      {!loading && !error && stats && <DashboardSummary stats={stats} />}
    </div>
  );
}
