import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { PrismaLeaveRepository } from '../src/repositories/LeaveRepository.js';
import { prisma } from '../src/repositories/prisma.js';
import { PrismaShiftRepository } from '../src/repositories/ShiftRepository.js';
import {
  LeaveService,
  type LeaveRepository,
  type LeaveRequest,
} from '../src/services/LeaveService.js';
import { ShiftService } from '../src/services/ShiftService.js';

const databaseDescribe = process.env.DATABASE_TESTS === 'true' ? describe : describe.skip;
const createdUserIds: string[] = [];

class SynchronizedFindRepository implements LeaveRepository {
  private arrivals = 0;
  private release!: () => void;
  private readonly gate = new Promise<void>(resolve => { this.release = resolve; });

  constructor(private readonly delegate: LeaveRepository) {}

  listForEmployee(employeeId: string) { return this.delegate.listForEmployee(employeeId); }
  listAll() { return this.delegate.listAll(); }
  create(input: Parameters<LeaveRepository['create']>[0]) { return this.delegate.create(input); }
  review(id: string, status: 'APPROVED' | 'REJECTED', reviewedById: string) {
    return this.delegate.review(id, status, reviewedById);
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    const request = await this.delegate.findById(id);
    this.arrivals += 1;
    if (this.arrivals === 2) this.release();
    await this.gate;
    return request;
  }
}

databaseDescribe('leave review database atomicity', () => {
  afterEach(async () => {
    if (createdUserIds.length === 0) return;
    await prisma.shift.deleteMany({ where: { createdById: { in: createdUserIds } } });
    await prisma.leaveRequest.deleteMany({ where: { employee: { userId: { in: createdUserIds } } } });
    await prisma.availability.deleteMany({ where: { employee: { userId: { in: createdUserIds } } } });
    await prisma.employee.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    createdUserIds.length = 0;
  });

  afterAll(async () => prisma.$disconnect());

  it.each([
    ['APPROVED', 'REJECTED'],
    ['APPROVED', 'APPROVED'],
    ['REJECTED', 'REJECTED'],
  ] as const)('allows exactly one synchronized %s versus %s transition', async (firstStatus, secondStatus) => {
    const suffix = `${Date.now()}-${Math.random()}`;
    const [approver, rejector, employeeUser] = await Promise.all([
      prisma.user.create({ data: { email: `leave-approver-${suffix}@test.local`, passwordHash: 'not-used', role: 'MANAGER' } }),
      prisma.user.create({ data: { email: `leave-rejector-${suffix}@test.local`, passwordHash: 'not-used', role: 'MANAGER' } }),
      prisma.user.create({ data: { email: `leave-employee-${suffix}@test.local`, passwordHash: 'not-used', role: 'EMPLOYEE' } }),
    ]);
    createdUserIds.push(approver.id, rejector.id, employeeUser.id);
    const employee = await prisma.employee.create({ data: {
      userId: employeeUser.id,
      firstName: 'LeaveReview',
      lastName: 'Synthetic',
      email: `leave-review-${suffix}@test.local`,
      jobTitle: 'team-member',
    } });
    const pending = await prisma.leaveRequest.create({ data: {
      employeeId: employee.id,
      startDate: new Date('2026-10-19T00:00:00.000Z'),
      endDate: new Date('2026-10-19T00:00:00.000Z'),
      reason: 'Synthetic concurrent review',
    } });
    const synchronized = new SynchronizedFindRepository(new PrismaLeaveRepository());
    const service = new LeaveService(synchronized);

    const results = await Promise.allSettled([
      service.review(pending.id, firstStatus, approver.id),
      service.review(pending.id, secondStatus, rejector.id),
    ]);

    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    const rejection = results.find(result => result.status === 'rejected');
    expect(rejection?.status === 'rejected' ? rejection.reason : undefined)
      .toMatchObject({ code: 'LEAVE_ALREADY_REVIEWED' });

    const winner = results.find(result => result.status === 'fulfilled');
    const stored = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: pending.id } });
    expect(winner?.status === 'fulfilled' ? winner.value.status : undefined).toBe(stored.status);
    expect(winner?.status === 'fulfilled' ? winner.value.reviewedById : undefined).toBe(stored.reviewedById);
    expect(winner?.status === 'fulfilled' ? winner.value.reviewedAt : undefined).toEqual(stored.reviewedAt);
    await expect(new LeaveService(new PrismaLeaveRepository()).review(pending.id, 'REJECTED', rejector.id))
      .rejects.toMatchObject({ code: 'LEAVE_ALREADY_REVIEWED' });
  });

  it('serializes leave approval against overlapping shift reassignment', async () => {
    const suffix = `${Date.now()}-${Math.random()}`;
    const manager = await prisma.user.create({ data: {
      email: `leave-reassignment-manager-${suffix}@test.local`, passwordHash: 'not-used', role: 'MANAGER',
    } });
    const employeeUser = await prisma.user.create({ data: {
      email: `leave-reassignment-employee-${suffix}@test.local`, passwordHash: 'not-used', role: 'EMPLOYEE',
    } });
    createdUserIds.push(manager.id, employeeUser.id);
    const employee = await prisma.employee.create({ data: {
      userId: employeeUser.id,
      firstName: 'LeaveReassignment',
      lastName: 'Synthetic',
      email: `leave-reassignment-${suffix}@test.local`,
      jobTitle: 'team-member',
    } });
    await prisma.availability.create({ data: {
      employeeId: employee.id,
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    } });
    const pending = await prisma.leaveRequest.create({ data: {
      employeeId: employee.id,
      startDate: new Date('2026-10-19T00:00:00.000Z'),
      endDate: new Date('2026-10-19T00:00:00.000Z'),
      reason: 'Synthetic reassignment race',
    } });
    const shift = await prisma.shift.create({ data: {
      date: new Date('2026-10-19T00:00:00.000Z'),
      startTime: '09:00',
      endTime: '17:00',
      role: 'team-member',
      createdById: manager.id,
    } });

    const results = await Promise.allSettled([
      new LeaveService(new PrismaLeaveRepository()).review(pending.id, 'APPROVED', manager.id),
      new ShiftService(new PrismaShiftRepository()).update(shift.id, { employeeId: employee.id }),
    ]);

    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    const rejection = results.find(result => result.status === 'rejected');
    expect(['EMPLOYEE_ON_LEAVE', 'SCHEDULE_CONFLICT']).toContain(
      rejection?.status === 'rejected' ? (rejection.reason as { code?: string }).code : undefined,
    );
    const storedLeave = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: pending.id } });
    const storedShift = await prisma.shift.findUniqueOrThrow({ where: { id: shift.id } });
    expect(storedLeave.status === 'APPROVED' && storedShift.employeeId === employee.id).toBe(false);
  });
});
