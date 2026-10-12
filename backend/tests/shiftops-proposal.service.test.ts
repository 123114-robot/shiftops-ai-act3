import { describe, expect, it } from 'vitest';
import {
  ShiftOpsProposalService,
  type ProposalRepository,
  type ShiftOpsIncident,
  type ShiftOpsProposal,
} from '../src/shiftops/ShiftOpsProposalService.js';

const now = new Date('2026-10-11T00:00:00.000Z');
const incident: ShiftOpsIncident = {
  id: 'incident-1', shiftId: 'shift-1', reason: 'employee_unavailable', status: 'OPEN',
  createdById: 'manager-1', createdAt: now,
};
const proposal: ShiftOpsProposal = {
  id: 'proposal-1', incidentId: incident.id, replacementEmployeeId: 'employee-liam',
  explanation: 'Eligible under deterministic scheduling rules.', status: 'PENDING_APPROVAL',
  approvedById: null, approvedAt: null, appliedAt: null, version: 1,
  shiftUpdatedAt: now, createdAt: now,
  incident,
};

const eligibility = (eligible = true) => ({
  evaluate: async () => ({
    shiftId: 'shift-1',
    candidates: [{ employeeId: 'employee-liam', eligible, score: eligible ? 1_000 : 0, reasons: ['AVAILABLE'], blockers: eligible ? [] : ['SHIFT_OVERLAP'] }],
  }),
});

const repository = (overrides: Partial<ProposalRepository> = {}): ProposalRepository => ({
  shiftExists: async () => true,
  createIncident: async input => ({ ...incident, ...input }),
  findIncident: async () => incident,
  createProposal: async input => ({ ...proposal, ...input }),
  findProposal: async () => proposal,
  transitionProposal: async input => ({ ...proposal, status: input.nextStatus, version: proposal.version + 1 }),
  applyProposal: async () => ({ ...proposal, status: 'APPLIED', appliedAt: now, version: proposal.version + 1 }),
  listAudit: async () => [],
  ...overrides,
});

describe('ShiftOpsProposalService', () => {
  it('creates an incident and an eligible pending proposal', async () => {
    const service = new ShiftOpsProposalService(repository(), eligibility(), {
      explain: async () => 'Grounded explanation for Liam.',
    });
    await expect(service.createIncident('manager-1', 'shift-1', 'employee_unavailable'))
      .resolves.toMatchObject({ status: 'OPEN', shiftId: 'shift-1' });
    await expect(service.createProposal('manager-1', 'incident-1', 'employee-liam'))
      .resolves.toMatchObject({
        status: 'PENDING_APPROVAL',
        replacementEmployeeId: 'employee-liam',
        explanation: 'Grounded explanation for Liam.',
      });
  });

  it('rejects missing shifts, missing incidents, and ineligible candidates', async () => {
    await expect(new ShiftOpsProposalService(repository({ shiftExists: async () => false }), eligibility())
      .createIncident('manager-1', 'missing', 'employee_unavailable'))
      .rejects.toMatchObject({ code: 'SHIFT_NOT_FOUND' });
    await expect(new ShiftOpsProposalService(repository({ findIncident: async () => null }), eligibility())
      .createProposal('manager-1', 'missing', 'employee-liam'))
      .rejects.toMatchObject({ code: 'INCIDENT_NOT_FOUND' });
    await expect(new ShiftOpsProposalService(repository(), eligibility(false))
      .createProposal('manager-1', 'incident-1', 'employee-liam'))
      .rejects.toMatchObject({ code: 'CANDIDATE_INELIGIBLE' });
  });

  it('allows only pending proposals to be approved or rejected', async () => {
    const service = new ShiftOpsProposalService(repository(), eligibility());
    await expect(service.approve('proposal-1', 'manager-1')).resolves.toMatchObject({ status: 'APPROVED' });
    await expect(service.reject('proposal-1', 'manager-1')).resolves.toMatchObject({ status: 'REJECTED' });
    const alreadyApproved = repository({ findProposal: async () => ({ ...proposal, status: 'APPROVED' }) });
    await expect(new ShiftOpsProposalService(alreadyApproved, eligibility()).reject('proposal-1', 'manager-1'))
      .rejects.toMatchObject({ code: 'INVALID_PROPOSAL_STATE' });
  });

  it('revalidates before apply and prevents rejected or repeated application', async () => {
    const approved = repository({ findProposal: async () => ({ ...proposal, status: 'APPROVED' }) });
    await expect(new ShiftOpsProposalService(approved, eligibility()).apply('proposal-1', 'manager-1'))
      .resolves.toMatchObject({ status: 'APPLIED' });
    await expect(new ShiftOpsProposalService(approved, eligibility(false)).apply('proposal-1', 'manager-1'))
      .rejects.toMatchObject({ code: 'CANDIDATE_INELIGIBLE' });
    for (const status of ['REJECTED', 'APPLIED'] as const) {
      const invalid = repository({ findProposal: async () => ({ ...proposal, status }) });
      await expect(new ShiftOpsProposalService(invalid, eligibility()).apply('proposal-1', 'manager-1'))
        .rejects.toMatchObject({ code: 'INVALID_PROPOSAL_STATE' });
    }
  });

  it('surfaces atomic stale and concurrency conflicts', async () => {
    const approved = { ...proposal, status: 'APPROVED' as const };
    const stale = repository({
      findProposal: async () => approved,
      applyProposal: async () => { throw Object.assign(new Error('stale'), { code: 'STALE_PROPOSAL' }); },
    });
    await expect(new ShiftOpsProposalService(stale, eligibility()).apply('proposal-1', 'manager-1'))
      .rejects.toMatchObject({ code: 'STALE_PROPOSAL' });
    const conflict = repository({
      findProposal: async () => proposal,
      transitionProposal: async () => { throw Object.assign(new Error('conflict'), { code: 'CONCURRENT_UPDATE' }); },
    });
    await expect(new ShiftOpsProposalService(conflict, eligibility()).approve('proposal-1', 'manager-1'))
      .rejects.toMatchObject({ code: 'CONCURRENT_UPDATE' });
  });
});
