import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand">
             Support &amp; SLA
          </Link>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/tickets">Tickets</Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
