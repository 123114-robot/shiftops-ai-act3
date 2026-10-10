import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { completeWeek, getEmployeeAvailability, type AvailabilityEntry } from '../api/availability';
import { AvailabilityWeek } from '../features/availability/AvailabilityWeek';
import { useAuth } from '../features/auth/auth-context';

export function EmployeeAvailabilityPage() {
  const { id = '' } = useParams();
  const { token } = useAuth();
  const [entries, setEntries] = useState<AvailabilityEntry[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (token) void getEmployeeAvailability(token, id).then((result) => setEntries(completeWeek(result))).catch((caught: Error) => setError(caught.message)); }, [id, token]);
  return <main className="dashboard-shell"><nav><strong>ShiftFlow</strong><Link to={`/employees/${id}`}>Back to employee</Link></nav><section className="dashboard-card availability-card"><p className="eyebrow">Recurring week</p><h1>Employee availability</h1>{error && <p role="alert">{error}</p>}{entries ? <AvailabilityWeek entries={entries} /> : !error && <p>Loading availability…</p>}</section></main>;
}
