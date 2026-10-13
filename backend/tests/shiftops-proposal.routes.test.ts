import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createShiftOpsProposalRouter, proposalErrorStatus } from '../src/routes/shiftops-proposals.js';
import { AuthenticationService, type AuthUserRepository } from '../src/services/AuthenticationService.js';

const hash = await bcrypt.hash('ShiftFlow123!', 4);
const users = [
  { id: 'manager-1', email: 'manager@test.local', passwordHash: hash, role: 'MANAGER' as const, employeeId: null },
  { id: 'user-1', email: 'employee@test.local', passwordHash: hash, role: 'EMPLOYEE' as const, employeeId: 'employee-1' },
];
const authRepository: AuthUserRepository = {
  findByEmail: async email => users.find(user => user.email === email) ?? null,
  findById: async id => users.find(user => user.id === id) ?? null,
};
const auth = new AuthenticationService(authRepository, 'test-secret-at-least-32-characters');
const incident = { id: 'incident-1', shiftId: 'shift-1', reason: 'employee_unavailable', status: 'OPEN' as const };
const proposal = { id: 'proposal-1', incidentId: 'incident-1', status: 'PENDING_APPROVAL' as const };
const service = {
  createIncident: async (actorId: string, shiftId: string, reason: string) => ({ ...incident, actorId, shiftId, reason }),
  evaluateIncident: async (id: string) => ({ incidentId: id, shiftId: 'shift-1', candidates: [{ employeeId: 'employee-liam', eligible: true, score: 1000, reasons: ['AVAILABLE'], blockers: [] }] }),
  createProposal: async (actorId: string, incidentId: string, replacementEmployeeId: string) => ({ ...proposal, actorId, incidentId, replacementEmployeeId }),
  approve: async (id: string, actorId: string) => ({ ...proposal, id, actorId, status: 'APPROVED' as const }),
  reject: async (id: string, actorId: string) => ({ ...proposal, id, actorId, status: 'REJECTED' as const }),
  apply: async (id: string, actorId: string) => ({ ...proposal, id, actorId, status: 'APPLIED' as const }),
  get: async (id: string) => ({ ...proposal, id }),
  listAudit: async () => [{ id: 'audit-1', action: 'PROPOSAL_CREATED' }],
};
const app = express();
app.use(express.json());
app.use('/api/shiftops', createShiftOpsProposalRouter(auth, service));
const token = async (email: string) => (await auth.login(email, 'ShiftFlow123!')).token;

describe('ShiftOps proposal routes', () => {
  it('maps every proposal domain error explicitly', () => {
    expect(proposalErrorStatus('SHIFT_NOT_FOUND')).toBe(404);
    expect(proposalErrorStatus('INCIDENT_NOT_FOUND')).toBe(404);
    expect(proposalErrorStatus('PROPOSAL_NOT_FOUND')).toBe(404);
    for (const code of ['INCIDENT_CLOSED', 'CANDIDATE_INELIGIBLE', 'INVALID_PROPOSAL_STATE', 'CONCURRENT_UPDATE', 'STALE_PROPOSAL'] as const) {
      expect(proposalErrorStatus(code)).toBe(409);
    }
  });
  it('supports the manager incident-to-apply workflow', async () => {
    const bearer = await token('manager@test.local');
    const headers = { Authorization: `Bearer ${bearer}` };
    expect((await request(app).post('/api/shiftops/incidents').set(headers).send({ shiftId: 'shift-1', reason: 'employee_unavailable' })).status).toBe(201);
    expect((await request(app).post('/api/shiftops/incidents/incident-1/evaluate').set(headers)).body.evaluation.candidates).toHaveLength(1);
    expect((await request(app).post('/api/shiftops/proposals').set(headers).send({ incidentId: 'incident-1', replacementEmployeeId: 'employee-liam' })).status).toBe(201);
    expect((await request(app).post('/api/shiftops/proposals/proposal-1/approve').set(headers)).body.proposal.status).toBe('APPROVED');
    expect((await request(app).post('/api/shiftops/proposals/proposal-1/apply').set(headers)).body.proposal.status).toBe('APPLIED');
    expect((await request(app).get('/api/shiftops/proposals/proposal-1').set(headers)).status).toBe(200);
    expect((await request(app).get('/api/shiftops/audit').set(headers)).body.auditEvents).toHaveLength(1);
  });

  it('supports manager rejection', async () => {
    const bearer = await token('manager@test.local');
    const response = await request(app).post('/api/shiftops/proposals/proposal-1/reject')
      .set('Authorization', `Bearer ${bearer}`);
    expect(response.body.proposal.status).toBe('REJECTED');
  });

  it('rejects invalid input and employee access', async () => {
    const manager = await token('manager@test.local');
    expect((await request(app).post('/api/shiftops/incidents').set('Authorization', `Bearer ${manager}`).send({ shiftId: '', reason: '' })).status).toBe(400);
    const employee = await token('employee@test.local');
    expect((await request(app).get('/api/shiftops/audit').set('Authorization', `Bearer ${employee}`)).status).toBe(403);
  });
});
