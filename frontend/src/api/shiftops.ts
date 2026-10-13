const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export type Candidate = { employeeId: string; eligible: boolean; score: number; reasons: string[]; blockers: string[] };
export type Proposal = { id: string; incidentId: string; replacementEmployeeId: string; explanation: string; status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'CANCELLED' };
export type AuditEvent = { id: string; action: string; entityId: string; newStatus: string; timestamp: string };

async function call<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}/shiftops${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
  });
  const body = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message ?? 'ShiftOps request failed.');
  return body;
}

export async function createIncident(token: string, shiftId: string, reason: string) {
  return (await call<{ incident: { id: string } }>(token, '/incidents', { method: 'POST', body: JSON.stringify({ shiftId, reason }) })).incident;
}
export async function evaluateIncident(token: string, incidentId: string) {
  return (await call<{ evaluation: { shiftId: string; candidates: Candidate[] } }>(token, `/incidents/${incidentId}/evaluate`, { method: 'POST' })).evaluation;
}
export async function createProposal(token: string, incidentId: string, replacementEmployeeId: string) {
  return (await call<{ proposal: Proposal }>(token, '/proposals', { method: 'POST', body: JSON.stringify({ incidentId, replacementEmployeeId }) })).proposal;
}
export async function transitionProposal(token: string, proposalId: string, action: 'approve' | 'apply') {
  return (await call<{ proposal: Proposal }>(token, `/proposals/${proposalId}/${action}`, { method: 'POST' })).proposal;
}
export async function listAudit(token: string) {
  return (await call<{ auditEvents: AuditEvent[] }>(token, '/audit')).auditEvents;
}
