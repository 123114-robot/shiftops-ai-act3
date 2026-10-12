import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { createIncident, createProposal, evaluateIncident, listAudit, transitionProposal, type AuditEvent, type Candidate, type Proposal } from '../api/shiftops';
import { useAuth } from '../features/auth/auth-context';

export function ShiftOpsPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({ shiftId: '', reason: '' });
  const [incidentId, setIncidentId] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function start(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy(true); setError(''); setProposal(null); setAudit([]);
    try {
      const incident = await createIncident(token, form.shiftId, form.reason);
      const evaluation = await evaluateIncident(token, incident.id);
      setIncidentId(incident.id); setCandidates(evaluation.candidates);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to evaluate this shift.'); }
    finally { setBusy(false); }
  }

  async function propose(employeeId: string) {
    if (!token) return;
    setBusy(true); setError('');
    try { setProposal(await createProposal(token, incidentId, employeeId)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create proposal.'); }
    finally { setBusy(false); }
  }

  async function transition(action: 'approve' | 'apply') {
    if (!token || !proposal) return;
    setBusy(true); setError('');
    try {
      const saved = await transitionProposal(token, proposal.id, action);
      setProposal(saved);
      if (action === 'apply') setAudit(await listAudit(token));
    } catch (caught) { setError(caught instanceof Error ? caught.message : `Unable to ${action} proposal.`); }
    finally { setBusy(false); }
  }

  return <main className="dashboard-shell"><nav><strong>ShiftFlow</strong><Link to="/dashboard">Back to dashboard</Link></nav><section className="dashboard-card shiftops-card">
    <p className="eyebrow">Manager workspace · human approval required</p><h1>ShiftOps copilot</h1>
    <p className="muted">Evaluate grounded replacement candidates, then explicitly approve before the schedule can change.</p>
    {error && <p role="alert">{error}</p>}
    <form className="shiftops-form" onSubmit={event => void start(event)}>
      <label>Shift ID<input required value={form.shiftId} onChange={event => setForm({ ...form, shiftId: event.target.value })}/></label>
      <label>Incident reason<input required maxLength={200} value={form.reason} onChange={event => setForm({ ...form, reason: event.target.value })}/></label>
      <button disabled={busy}>Create incident and evaluate</button>
    </form>
    {candidates.length > 0 && <section><h2>Candidate comparison</h2><div className="candidate-list">{candidates.map(candidate => <article key={candidate.employeeId}>
      <div><strong>{candidate.employeeId}</strong><span className={`badge badge--${candidate.eligible ? 'active' : 'inactive'}`}>{candidate.eligible ? 'ELIGIBLE' : 'BLOCKED'}</span></div>
      <p>Score: {candidate.score}</p><p>{(candidate.eligible ? candidate.reasons : candidate.blockers).join(' · ')}</p>
      {candidate.eligible && !proposal && <button disabled={busy} onClick={() => void propose(candidate.employeeId)}>Propose {candidate.employeeId}</button>}
    </article>)}</div></section>}
    {proposal && <section className="proposal-card"><h2>Proposal</h2><p><strong>{proposal.replacementEmployeeId}</strong> <span className="badge">{proposal.status}</span></p><p>{proposal.explanation}</p>
      {proposal.status === 'PENDING_APPROVAL' && <button disabled={busy} onClick={() => void transition('approve')}>Approve proposal</button>}
      {proposal.status === 'APPROVED' && <button disabled={busy} onClick={() => void transition('apply')}>Apply approved proposal</button>}
    </section>}
    {audit.length > 0 && <section><h2>Audit history</h2><div className="audit-list">{audit.map(event => <article key={event.id}><strong>{event.action}</strong><span>{event.entityId} · {event.newStatus}</span></article>)}</div></section>}
  </section></main>;
}
