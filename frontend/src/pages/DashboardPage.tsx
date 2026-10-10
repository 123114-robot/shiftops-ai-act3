import { useEffect, useState } from 'react';
import { getDashboard, type DashboardSummary } from '../api/dashboard';
import { useAuth } from '../features/auth/auth-context';

const localDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DashboardPage({ employee = false }: { employee?: boolean }) {
  const { user, token, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee || !token) return;
    const today = new Date();
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
    setError('');
    void getDashboard(token, localDate(today), localDate(weekStart))
      .then(setSummary)
      .catch(() => setError('Dashboard metrics are temporarily unavailable.'));
  }, [employee, token]);

  return (
    <main className="dashboard-shell">
      <nav>
        <strong>ShiftFlow</strong>
        <div><span>{user?.email}</span><button className="secondary" onClick={logout}>Log out</button></div>
      </nav>
      <section className="dashboard-card">
        <p className="eyebrow">{employee ? 'Employee workspace' : 'Manager workspace'}</p>
        <h1>{employee ? 'My schedule' : 'Manager dashboard'}</h1>
        {!employee && !summary && !error && <p className="muted">Loading dashboard metrics…</p>}
        {!employee && error && <p role="alert">{error}</p>}
        {!employee && summary && (
          <div className="dashboard-metrics">
            <article><strong>{summary.employeesWorkingToday}</strong><span>Working today</span></article>
            <article><strong>{summary.unfilledShifts}</strong><span>Unfilled shifts</span></article>
            <article><strong>{summary.employeesOnLeave}</strong><span>On approved leave</span></article>
            <article><strong>{summary.totalScheduledHours}</strong><span>Scheduled hours</span></article>
          </div>
        )}
        <p className="muted">Core workforce scheduling workflows are available below.</p>
        {employee ? (
          <div className="detail-actions">
            <a href="/my-roster">View weekly schedule</a>
            <a href="/availability">Manage my availability</a>
            <a href="/my-leave">My leave</a>
          </div>
        ) : (
          <div className="detail-actions">
            <a href="/roster">Weekly roster</a>
            <a href="/employees">Manage employees</a>
            <a href="/shifts">Manage shifts</a>
            <a href="/leave-requests">Review leave</a>
          </div>
        )}
      </section>
    </main>
  );
}
