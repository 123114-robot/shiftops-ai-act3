import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/repositories/prisma.js';
import { PrismaProposalRepository } from '../src/shiftops/PrismaProposalRepository.js';
import { PrismaShiftOpsRepository } from '../src/shiftops/PrismaShiftOpsRepository.js';
import { ShiftOpsEligibilityService } from '../src/shiftops/ShiftOpsEligibilityService.js';
import { ProposalError, ShiftOpsProposalService } from '../src/shiftops/ShiftOpsProposalService.js';
import { PrismaShiftRepository } from '../src/repositories/ShiftRepository.js';
import { ShiftService } from '../src/services/ShiftService.js';

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

  it('serializes overlapping proposal applies for the same employee', async () => {
    const suffix = `${Date.now()}-${Math.random()}`;
    const manager = await prisma.user.create({ data: { email: `manager-race-${suffix}@test.local`, passwordHash: 'not-used', role: 'MANAGER' } });
    const employeeUser = await prisma.user.create({ data: { email: `employee-race-${suffix}@test.local`, passwordHash: 'not-used', role: 'EMPLOYEE' } });
    createdUserIds.push(manager.id, employeeUser.id);
    const employee = await prisma.employee.create({ data: { userId: employeeUser.id, firstName: 'Race', lastName: 'Synthetic', email: `race-${suffix}@test.local`, jobTitle: 'team-member' } });
    await prisma.availability.create({ data: { employeeId: employee.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true } });
    const shifts = await Promise.all(['first', 'second'].map(notes => prisma.shift.create({ data: {
      date: new Date('2026-10-19T00:00:00.000Z'), startTime: '09:00', endTime: '17:00', role: 'team-member', notes, createdById: manager.id,
    } })));
    const policy = { maxWeeklyMinutes: 2_400, requireRoleMatch: true };
    const service = new ShiftOpsProposalService(new PrismaProposalRepository(policy), new ShiftOpsEligibilityService(new PrismaShiftOpsRepository(), policy));
    const approved = [];
    for (const shift of shifts) {
      const incident = await service.createIncident(manager.id, shift.id, 'employee_unavailable');
      const proposal = await service.createProposal(manager.id, incident.id, employee.id);
      approved.push(await service.approve(proposal.id, manager.id));
    }

    const results = await Promise.allSettled(approved.map(proposal => service.apply(proposal.id, manager.id)));
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(await prisma.shift.count({ where: { id: { in: shifts.map(shift => shift.id) }, employeeId: employee.id } })).toBe(1);
    expect(await prisma.shiftOpsAuditEvent.count({ where: { actorId: manager.id, action: 'PROPOSAL_APPLIED' } })).toBe(1);
  });

  it('serializes ordinary shift creation against proposal apply for the same employee', async () => {
    const suffix = `${Date.now()}-${Math.random()}`;
    const manager = await prisma.user.create({ data: { email: `manager-cross-route-${suffix}@test.local`, passwordHash: 'not-used', role: 'MANAGER' } });
    const employeeUser = await prisma.user.create({ data: { email: `employee-cross-route-${suffix}@test.local`, passwordHash: 'not-used', role: 'EMPLOYEE' } });
    createdUserIds.push(manager.id, employeeUser.id);
    const employee = await prisma.employee.create({ data: { userId: employeeUser.id, firstName: 'CrossRoute', lastName: 'Synthetic', email: `cross-route-${suffix}@test.local`, jobTitle: 'team-member' } });
    await prisma.availability.create({ data: { employeeId: employee.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true } });
    const target = await prisma.shift.create({ data: {
      date: new Date('2026-10-19T00:00:00.000Z'), startTime: '09:00', endTime: '17:00', role: 'team-member', notes: 'proposal-target', createdById: manager.id,
    } });
    const policy = { maxWeeklyMinutes: 2_400, requireRoleMatch: true };
    const proposalService = new ShiftOpsProposalService(new PrismaProposalRepository(policy), new ShiftOpsEligibilityService(new PrismaShiftOpsRepository(), policy));
    const incident = await proposalService.createIncident(manager.id, target.id, 'employee_unavailable');
    const proposal = await proposalService.createProposal(manager.id, incident.id, employee.id);
    const approved = await proposalService.approve(proposal.id, manager.id);
    const shiftService = new ShiftService(new PrismaShiftRepository());

    const results = await Promise.allSettled([
      proposalService.apply(approved.id, manager.id),
      shiftService.create(manager.id, {
        employeeId: employee.id,
        date: '2026-10-19',
        startTime: '09:00',
        endTime: '17:00',
        role: 'team-member',
        notes: 'ordinary-create',
      }),
    ]);

    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(await prisma.shift.count({ where: {
      employeeId: employee.id,
      date: new Date('2026-10-19T00:00:00.000Z'),
      startTime: { lt: '17:00' },
      endTime: { gt: '09:00' },
      status: { not: 'CANCELLED' },
    } })).toBe(1);
  });
});
