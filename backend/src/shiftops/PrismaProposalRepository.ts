import { prisma } from '../repositories/prisma.js';
import {
  ProposalError,
  type ProposalRepository,
} from './ShiftOpsProposalService.js';
import { PrismaShiftOpsRepository } from './PrismaShiftOpsRepository.js';
import { ShiftOpsEligibilityService, type ShiftOpsEligibilityPolicy } from './ShiftOpsEligibilityService.js';
import { lockEmployeeSchedule, withSerializableRetry } from './SchedulingTransaction.js';

const proposalInclude = { incident: true } as const;

export class PrismaProposalRepository implements ProposalRepository {
  constructor(private readonly eligibilityPolicy: ShiftOpsEligibilityPolicy = {
    maxWeeklyMinutes: 2_400,
    requireRoleMatch: true,
  }) {}
  async shiftExists(shiftId: string) {
    return (await prisma.shift.count({ where: { id: shiftId, status: { not: 'CANCELLED' } } })) > 0;
  }

  async createIncident(input: { shiftId: string; reason: string; createdById: string }) {
    return prisma.$transaction(async tx => {
      const incident = await tx.shiftIncident.create({ data: input });
      await tx.shiftOpsAuditEvent.create({
        data: {
          actorId: input.createdById,
          action: 'INCIDENT_CREATED',
          entityId: incident.id,
          previousStatus: null,
          newStatus: incident.status,
          details: { shiftId: input.shiftId, reason: input.reason },
        },
      });
      return incident;
    });
  }

  findIncident(id: string) {
    return prisma.shiftIncident.findUnique({ where: { id } });
  }

  async createProposal(input: {
    incidentId: string;
    replacementEmployeeId: string;
    explanation: string;
    actorId: string;
  }) {
    return prisma.$transaction(async tx => {
      const incident = await tx.shiftIncident.findUniqueOrThrow({
        where: { id: input.incidentId },
        include: { shift: { select: { updatedAt: true } } },
      });
      const proposal = await tx.shiftProposal.create({
        data: {
          incidentId: input.incidentId,
          replacementEmployeeId: input.replacementEmployeeId,
          explanation: input.explanation,
          shiftUpdatedAt: incident.shift.updatedAt,
        },
        include: proposalInclude,
      });
      await tx.shiftOpsAuditEvent.create({
        data: {
          actorId: input.actorId,
          action: 'PROPOSAL_CREATED',
          entityId: proposal.id,
          previousStatus: null,
          newStatus: proposal.status,
          details: {
            incidentId: input.incidentId,
            replacementEmployeeId: input.replacementEmployeeId,
          },
        },
      });
      return proposal;
    });
  }

  findProposal(id: string) {
    return prisma.shiftProposal.findUnique({ where: { id }, include: proposalInclude });
  }

  async transitionProposal(input: {
    id: string;
    expectedVersion: number;
    nextStatus: 'APPROVED' | 'REJECTED';
    actorId: string;
  }) {
    return prisma.$transaction(async tx => {
      const timestamp = new Date();
      const updated = await tx.shiftProposal.updateMany({
        where: { id: input.id, version: input.expectedVersion, status: 'PENDING_APPROVAL' },
        data: {
          status: input.nextStatus,
          version: { increment: 1 },
          ...(input.nextStatus === 'APPROVED'
            ? { approvedById: input.actorId, approvedAt: timestamp }
            : {}),
        },
      });
      if (updated.count !== 1) {
        throw new ProposalError('CONCURRENT_UPDATE', 'Proposal changed before this review completed.');
      }
      await tx.shiftOpsAuditEvent.create({
        data: {
          actorId: input.actorId,
          action: input.nextStatus === 'APPROVED' ? 'PROPOSAL_APPROVED' : 'PROPOSAL_REJECTED',
          entityId: input.id,
          previousStatus: 'PENDING_APPROVAL',
          newStatus: input.nextStatus,
          details: { version: input.expectedVersion + 1 },
        },
      });
      return tx.shiftProposal.findUniqueOrThrow({ where: { id: input.id }, include: proposalInclude });
    });
  }

  async applyProposal(input: { id: string; expectedVersion: number; actorId: string }) {
    return withSerializableRetry(async tx => {
      const initial = await tx.shiftProposal.findUniqueOrThrow({ where: { id: input.id } });
      await lockEmployeeSchedule(tx, initial.replacementEmployeeId);
      const proposal = await tx.shiftProposal.findUniqueOrThrow({
        where: { id: input.id },
        include: { incident: true },
      });
      if (proposal.status !== 'APPROVED' || proposal.version !== input.expectedVersion) {
        throw new ProposalError('CONCURRENT_UPDATE', 'Proposal changed before it could be applied.');
      }

      const evaluation = await new ShiftOpsEligibilityService(
        new PrismaShiftOpsRepository(tx),
        this.eligibilityPolicy,
      ).evaluate(proposal.incident.shiftId);
      const candidate = evaluation.candidates.find(item => item.employeeId === proposal.replacementEmployeeId);
      if (!candidate?.eligible) {
        throw new ProposalError('CANDIDATE_INELIGIBLE', 'Replacement employee is no longer eligible for this shift.');
      }

      const shiftUpdate = await tx.shift.updateMany({
        where: {
          id: proposal.incident.shiftId,
          updatedAt: proposal.shiftUpdatedAt,
          status: { not: 'CANCELLED' },
        },
        data: { employeeId: proposal.replacementEmployeeId, status: 'SCHEDULED' },
      });
      if (shiftUpdate.count !== 1) {
        throw new ProposalError('STALE_PROPOSAL', 'Shift changed after this proposal was created.');
      }

      const proposalUpdate = await tx.shiftProposal.updateMany({
        where: { id: input.id, version: input.expectedVersion, status: 'APPROVED' },
        data: { status: 'APPLIED', appliedAt: new Date(), version: { increment: 1 } },
      });
      if (proposalUpdate.count !== 1) {
        throw new ProposalError('CONCURRENT_UPDATE', 'Proposal changed before it could be applied.');
      }

      await tx.shiftIncident.update({
        where: { id: proposal.incidentId },
        data: { status: 'RESOLVED' },
      });
      await tx.shiftOpsAuditEvent.create({
        data: {
          actorId: input.actorId,
          action: 'PROPOSAL_APPLIED',
          entityId: input.id,
          previousStatus: 'APPROVED',
          newStatus: 'APPLIED',
          details: {
            shiftId: proposal.incident.shiftId,
            replacementEmployeeId: proposal.replacementEmployeeId,
            version: input.expectedVersion + 1,
          },
        },
      });
      return tx.shiftProposal.findUniqueOrThrow({ where: { id: input.id }, include: proposalInclude });
    });
  }

  listAudit() {
    return prisma.shiftOpsAuditEvent.findMany({ orderBy: { timestamp: 'desc' } });
  }
}
