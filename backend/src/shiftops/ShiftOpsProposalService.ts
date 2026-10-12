import {
  DeterministicExplanationProvider,
  type ExplanationProvider,
} from './ShiftOpsExplanationProvider.js';

export type IncidentStatus = 'OPEN' | 'RESOLVED' | 'CANCELLED';
export type ProposalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'CANCELLED';

export type ShiftOpsIncident = {
  id: string;
  shiftId: string;
  reason: string;
  status: IncidentStatus;
  createdById: string;
  createdAt: Date;
};

export type ShiftOpsProposal = {
  id: string;
  incidentId: string;
  replacementEmployeeId: string;
  explanation: string;
  status: ProposalStatus;
  approvedById: string | null;
  approvedAt: Date | null;
  appliedAt: Date | null;
  version: number;
  shiftUpdatedAt: Date;
  createdAt: Date;
  incident: ShiftOpsIncident;
};

export type AuditRecord = {
  id: string;
  actorId: string;
  action: string;
  entityId: string;
  previousStatus: string | null;
  newStatus: string;
  timestamp: Date;
  details: unknown;
};

export interface ProposalRepository {
  shiftExists(shiftId: string): Promise<boolean>;
  createIncident(input: { shiftId: string; reason: string; createdById: string }): Promise<ShiftOpsIncident>;
  findIncident(id: string): Promise<ShiftOpsIncident | null>;
  createProposal(input: {
    incidentId: string;
    replacementEmployeeId: string;
    explanation: string;
    actorId: string;
  }): Promise<ShiftOpsProposal>;
  findProposal(id: string): Promise<ShiftOpsProposal | null>;
  transitionProposal(input: {
    id: string;
    expectedVersion: number;
    nextStatus: 'APPROVED' | 'REJECTED';
    actorId: string;
  }): Promise<ShiftOpsProposal>;
  applyProposal(input: {
    id: string;
    expectedVersion: number;
    actorId: string;
  }): Promise<ShiftOpsProposal>;
  listAudit(): Promise<AuditRecord[]>;
}
export interface EligibilityEvaluator {
  evaluate(shiftId: string): Promise<{
    shiftId: string;
    candidates: Array<{
      employeeId: string;
      eligible: boolean;
      score: number;
      reasons: string[];
      blockers: readonly string[];
    }>;
  }>;
}
export type ProposalErrorCode =
  | 'SHIFT_NOT_FOUND'
  | 'INCIDENT_NOT_FOUND'
  | 'INCIDENT_CLOSED'
  | 'PROPOSAL_NOT_FOUND'
  | 'CANDIDATE_INELIGIBLE'
  | 'INVALID_PROPOSAL_STATE'
  | 'CONCURRENT_UPDATE'
  | 'STALE_PROPOSAL';

export class ProposalError extends Error {
  constructor(public readonly code: ProposalErrorCode, message: string) {
    super(message);
  }
}
export class ShiftOpsProposalService {
  constructor(
    private readonly proposals: ProposalRepository,
    private readonly eligibility: EligibilityEvaluator,
    private readonly explanations: ExplanationProvider = new DeterministicExplanationProvider(),
  ) {}

  async createIncident(createdById: string, shiftId: string, reason: string) {
    if (!(await this.proposals.shiftExists(shiftId))) {
      throw new ProposalError('SHIFT_NOT_FOUND', 'Shift not found.');
    }
    return this.proposals.createIncident({ shiftId, reason, createdById });
  }

  async evaluateIncident(incidentId: string) {
    const incident = await this.proposals.findIncident(incidentId);
    if (!incident) throw new ProposalError('INCIDENT_NOT_FOUND', 'Incident not found.');
    if (incident.status !== 'OPEN') throw new ProposalError('INCIDENT_CLOSED', 'Incident is not open.');
    return this.eligibility.evaluate(incident.shiftId);
  }

  async createProposal(actorId: string, incidentId: string, replacementEmployeeId: string) {
    const incident = await this.proposals.findIncident(incidentId);
    if (!incident) throw new ProposalError('INCIDENT_NOT_FOUND', 'Incident not found.');
    if (incident.status !== 'OPEN') throw new ProposalError('INCIDENT_CLOSED', 'Incident is not open.');

    const evaluation = await this.eligibility.evaluate(incident.shiftId);
    const candidate = evaluation.candidates.find(item => item.employeeId === replacementEmployeeId);
    if (!candidate?.eligible) {
      throw new ProposalError('CANDIDATE_INELIGIBLE', 'Replacement employee is not eligible for this shift.');
    }

    const explanation = await this.explanations.explain({
      shiftId: incident.shiftId,
      employeeId: candidate.employeeId,
      score: candidate.score,
      reasons: candidate.reasons,
    });

    return this.proposals.createProposal({
      incidentId,
      replacementEmployeeId,
      explanation,
      actorId,
    });
  }

  async approve(id: string, actorId: string) {
    const proposal = await this.requirePending(id);
    return this.proposals.transitionProposal({
      id,
      expectedVersion: proposal.version,
      nextStatus: 'APPROVED',
      actorId,
    });
  }

  async reject(id: string, actorId: string) {
    const proposal = await this.requirePending(id);
    return this.proposals.transitionProposal({
      id,
      expectedVersion: proposal.version,
      nextStatus: 'REJECTED',
      actorId,
    });
  }

  async apply(id: string, actorId: string) {
    const proposal = await this.requireProposal(id);
    if (proposal.status !== 'APPROVED') {
      throw new ProposalError('INVALID_PROPOSAL_STATE', 'Only an approved proposal can be applied.');
    }

    const evaluation = await this.eligibility.evaluate(proposal.incident.shiftId);
    const candidate = evaluation.candidates.find(item => item.employeeId === proposal.replacementEmployeeId);
    if (!candidate?.eligible) {
      throw new ProposalError('CANDIDATE_INELIGIBLE', 'Replacement employee is no longer eligible for this shift.');
    }

    return this.proposals.applyProposal({ id, expectedVersion: proposal.version, actorId });
  }

  get(id: string) {
    return this.requireProposal(id);
  }

  listAudit() {
    return this.proposals.listAudit();
  }

  private async requirePending(id: string) {
    const proposal = await this.requireProposal(id);
    if (proposal.status !== 'PENDING_APPROVAL') {
      throw new ProposalError('INVALID_PROPOSAL_STATE', 'Only a pending proposal can be reviewed.');
    }
    return proposal;
  }

  private async requireProposal(id: string) {
    const proposal = await this.proposals.findProposal(id);
    if (!proposal) throw new ProposalError('PROPOSAL_NOT_FOUND', 'Proposal not found.');
    return proposal;
  }
}
// End of the proposal workflow service.
