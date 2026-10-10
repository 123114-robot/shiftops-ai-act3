import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { completeWeek, getMyAvailability, replaceMyAvailability, type AvailabilityEntry } from '../api/availability';
import { AvailabilityWeek } from '../features/availability/AvailabilityWeek';
import { useAuth } from '../features/auth/auth-context';

export function AvailabilityPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<AvailabilityEntry[] | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) void getMyAvailability(token).then((result) => setEntries(completeWeek(result))).catch((caught: Error) => setError(caught.message));
  }, [token]);

  async function save() {
    if (!token || !entries) return;
    try {
      setError(''); setMessage('');
      setEntries(completeWeek(await replaceMyAvailability(token, entries.map(({ dayOfWeek, startTime, endTime, isAvailable }) => ({ dayOfWeek, startTime, endTime, isAvailable })))));
      setMessage('Availability saved successfully.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save availability.'); }
  }

  return <main className="dashboard-shell"><nav><strong>ShiftFlow</strong><Link to="/my-schedule">Back to workspace</Link></nav><section className="dashboard-card availability-card"><p className="eyebrow">Recurring week</p><h1>My availability</h1><p className="muted">Set the hours you can normally work each week.</p>{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}{entries ? <><AvailabilityWeek entries={entries} editable onChange={setEntries} /><button onClick={() => void save()}>Save availability</button></> : !error && <p>Loading availability…</p>}</section></main>;
}
