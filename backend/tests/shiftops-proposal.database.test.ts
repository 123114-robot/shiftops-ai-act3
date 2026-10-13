import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/repositories/prisma.js';
import { PrismaProposalRepository } from '../src/shiftops/PrismaProposalRepository.js';
import { PrismaShiftOpsRepository } from '../src/shiftops/PrismaShiftOpsRepository.js';
import { ShiftOpsEligibilityService } from '../src/shiftops/ShiftOpsEligibilityService.js';
import { ProposalError, ShiftOpsProposalService } from '../src/shiftops/ShiftOpsProposalService.js';

const databaseDescribe = process.env.DATABASE_TESTS === 'true' ? describe : describe.skip;
const createdUserIds: string[] = [];

databaseDescribe('ShiftOps proposal database transaction', () => {
  afterEach(async () => {
    if (createdUserIds.length === 0) return;
    await prisma.shiftOpsAuditEvent.deleteMany({ where: { actorId: { in: createdUserIds } } });
    await prisma.shiftProposal.deleteMany({ where: { incident: { createdById: { in: createdUserIds } } } });
    await prisma.shiftIncident.deleteMany({ where: { createdById: { in: createdUserIds } } });
    await prisma.shift.deleteMany({ where: { createdById: { in: createdUserIds } } });
    await prisma.availability.deleteMany({ where: { employee: { userId: { in: createdUserIds } } } });
    await prisma.employee.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    createdUserIds.length = 0;
  });

  afterAll(async () => prisma.$disconnect());

  it('atomically applies one approved replacement and records audit events', async () => {
    const suffix = `${Date.now()}-${Math.random()}`;
    const manager = await prisma.user.create({
      data: { email: `manager-${suffix}@test.local`, passwordHash: 'not-used', role: 'MANAGER' },
    });
    const employeeUser = await prisma.user.create({
      data: { email: `employee-${suffix}@test.local`, passwordHash: 'not-used', role: 'EMPLOYEE' },
    });
    createdUserIds.push(manager.id, employeeUser.id);
    const employee = await prisma.employee.create({
      data: {
        userId: employeeUser.id,
        firstName: 'Liam',
        lastName: 'Synthetic',
        email: `liam-${suffix}@test.local`,
        jobTitle: 'team-member',
      },
    });
    await prisma.availability.create({
      data: {
        employeeId: employee.id,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
    });
    const shift = await prisma.shift.create({
      data: {
        date: new Date('2026-10-19T00:00:00.000Z'),
        startTime: '09:00',
        endTime: '17:00',
        role: 'team-member',
        createdById: manager.id,
      },
    });

    const eligibility = new ShiftOpsEligibilityService(new PrismaShiftOpsRepository(), {
      maxWeeklyMinutes: 2_400,
      requireRoleMatch: true,
    });
    const service = new ShiftOpsProposalService(new PrismaProposalRepository(), eligibility);
    const incident = await service.createIncident(manager.id, shift.id, 'employee_unavailable');
    const proposal = await service.createProposal(manager.id, incident.id, employee.id);
    const approved = await service.approve(proposal.id, manager.id);
    const applied = await service.apply(approved.id, manager.id);

    expect(applied.status).toBe('APPLIED');
    expect((await prisma.shift.findUniqueOrThrow({ where: { id: shift.id } })).employeeId).toBe(employee.id);
    expect((await service.listAudit()).filter(event => event.actorId === manager.id)).toHaveLength(4);
    await expect(service.apply(applied.id, manager.id)).rejects.toEqual(
      expect.objectContaining<Partial<ProposalError>>({ code: 'INVALID_PROPOSAL_STATE' }),
    );
  });
});
