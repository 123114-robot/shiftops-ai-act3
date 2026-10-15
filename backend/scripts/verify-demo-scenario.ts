import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { PrismaDashboardRepository } from '../src/repositories/DashboardRepository.js';
import { prisma } from '../src/repositories/prisma.js';
import { DashboardService } from '../src/services/DashboardService.js';
import { PrismaProposalRepository } from '../src/shiftops/PrismaProposalRepository.js';
import { PrismaShiftOpsRepository } from '../src/shiftops/PrismaShiftOpsRepository.js';
import { ShiftOpsEligibilityService } from '../src/shiftops/ShiftOpsEligibilityService.js';
import { ShiftOpsProposalService } from '../src/shiftops/ShiftOpsProposalService.js';

const scenarioDate = '2026-10-16';
const scenarioDateUtc = new Date(`${scenarioDate}T00:00:00.000Z`);
const policy = { maxWeeklyMinutes: 2_400, requireRoleMatch: true };
const runId = `${Date.now()}-${process.pid}`;
const createdUserIds: string[] = [];

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for the local PostgreSQL demo verification.');
}

async function cleanup() {
  if (createdUserIds.length === 0) return;
  await prisma.shiftOpsAuditEvent.deleteMany({ where: { actorId: { in: createdUserIds } } });
  await prisma.shiftProposal.deleteMany({ where: { incident: { createdById: { in: createdUserIds } } } });
  await prisma.shiftIncident.deleteMany({ where: { createdById: { in: createdUserIds } } });
  await prisma.shift.deleteMany({ where: { createdById: { in: createdUserIds } } });
  await prisma.availability.deleteMany({ where: { employee: { userId: { in: createdUserIds } } } });
  await prisma.employee.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
}

try {
  const manager = await prisma.user.create({
    data: { email: `demo-manager-${runId}@synthetic.local`, passwordHash: 'not-used', role: 'MANAGER' },
  });
  createdUserIds.push(manager.id);
  const eligibleUser = await prisma.user.create({
    data: { email: `demo-operator-${runId}@synthetic.local`, passwordHash: 'not-used', role: 'EMPLOYEE' },
  });
  createdUserIds.push(eligibleUser.id);
  const blockedUser = await prisma.user.create({
    data: { email: `demo-supervisor-${runId}@synthetic.local`, passwordHash: 'not-used', role: 'EMPLOYEE' },
  });
  createdUserIds.push(blockedUser.id);

  const [eligibleEmployee, blockedEmployee] = await Promise.all([
    prisma.employee.create({ data: {
      userId: eligibleUser.id,
      firstName: 'Avery',
      lastName: 'Synthetic',
      email: `demo-operator-${runId}@synthetic.local`,
      jobTitle: 'Machine Operator',
    } }),
    prisma.employee.create({ data: {
      userId: blockedUser.id,
      firstName: 'Blake',
      lastName: 'Synthetic',
      email: `demo-supervisor-${runId}@synthetic.local`,
      jobTitle: 'Supervisor',
    } }),
  ]);
  await prisma.availability.createMany({ data: [eligibleEmployee, blockedEmployee].map(employee => ({
    employeeId: employee.id,
    dayOfWeek: 'FRIDAY',
    startTime: '06:00',
    endTime: '14:00',
    isAvailable: true,
  })) });
  const shift = await prisma.shift.create({ data: {
    date: scenarioDateUtc,
    startTime: '06:00',
    endTime: '14:00',
    role: 'Machine Operator',
    notes: 'Synthetic packaging-line staffing shortage',
    status: 'DRAFT',
    createdById: manager.id,
  } });

  const dashboard = new DashboardService(new PrismaDashboardRepository());
  const before = await dashboard.summary(scenarioDate, '2026-10-12');
  const eligibility = new ShiftOpsEligibilityService(new PrismaShiftOpsRepository(), policy);
  const proposals = new ShiftOpsProposalService(new PrismaProposalRepository(policy), eligibility);
  const incident = await proposals.createIncident(manager.id, shift.id, 'unexpected_operator_absence');
  const evaluation = await proposals.evaluateIncident(incident.id);
  const eligible = evaluation.candidates.find(candidate => candidate.employeeId === eligibleEmployee.id);
  const blocked = evaluation.candidates.find(candidate => candidate.employeeId === blockedEmployee.id);
  if (!eligible?.eligible || blocked?.eligible || !blocked?.blockers.includes('ROLE_MISMATCH')) {
    throw new Error('Synthetic demo candidates did not produce the expected eligibility outcome.');
  }
  const proposal = await proposals.createProposal(manager.id, incident.id, eligibleEmployee.id);
  const approved = await proposals.approve(proposal.id, manager.id);
  const applied = await proposals.apply(approved.id, manager.id);
  const after = await dashboard.summary(scenarioDate, '2026-10-12');
  const auditActions = (await proposals.listAudit())
    .filter(event => event.actorId === manager.id)
    .map(event => event.action)
    .sort();
  const expectedAuditActions = ['INCIDENT_CREATED', 'PROPOSAL_APPLIED', 'PROPOSAL_APPROVED', 'PROPOSAL_CREATED'];
  if (
    before.unfilledShifts < 1
    || after.unfilledShifts !== before.unfilledShifts - 1
    || applied.status !== 'APPLIED'
    || JSON.stringify(auditActions) !== JSON.stringify(expectedAuditActions)
  ) {
    throw new Error('Synthetic demo did not produce the expected schedule, KPI, and audit outcome.');
  }

  const evidence = {
    schemaVersion: 1,
    verificationStatus: 'VERIFIED_LOCAL_POSTGRESQL_DEMO',
    verifiedAtUtc: new Date().toISOString(),
    gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    fixture: 'synthetic-only',
    scenario: 'unexpected manufacturing machine-operator absence',
    workflow: ['incident', 'eligibility', 'proposal', 'manager-approval', 'atomic-apply', 'audit'],
    candidateEvidence: {
      eligibleCount: evaluation.candidates.filter(candidate => candidate.eligible).length,
      blockedCount: evaluation.candidates.filter(candidate => !candidate.eligible).length,
      demonstratedBlocker: 'ROLE_MISMATCH',
    },
    outcome: {
      unfilledShiftsBefore: before.unfilledShifts,
      unfilledShiftsAfter: after.unfilledShifts,
      staffingGapResolved: true,
      proposalStatus: applied.status,
      auditActions,
    },
    explanationSource: 'deterministic',
    amdRuntimeEvidence: false,
    scope: 'Proves one local synthetic PostgreSQL workflow and backend-derived KPI only; it is not AMD runtime, browser, deployment, or production evidence.',
  };
  await cleanup();
  createdUserIds.length = 0;
  const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
  const outputPath = process.env.DEMO_EVIDENCE_FILE;
  if (outputPath) writeFileSync(outputPath, serialized, { encoding: 'utf8', flag: 'wx' });
  process.stdout.write(serialized);
} finally {
  await cleanup();
  await prisma.$disconnect();
}
