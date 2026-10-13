import { describe, expect, it } from 'vitest';
import {
  ShiftOpsEligibilityService,
  type ShiftOpsCandidateRecord,
  type ShiftOpsRepository,
} from '../src/shiftops/ShiftOpsEligibilityService.js';

const shift = {
  id: 'shift-001',
  employeeId: null,
  date: new Date('2026-10-19T00:00:00.000Z'),
  startTime: '09:00',
  endTime: '17:00',
  role: 'team-member',
};

const candidate = (
  overrides: Partial<ShiftOpsCandidateRecord> = {},
): ShiftOpsCandidateRecord => ({
  employeeId: 'employee-liam',
  status: 'ACTIVE',
  jobTitle: 'team-member',
  availability: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  hasApprovedLeave: false,
  hasOverlap: false,
  weeklyScheduledMinutes: 480,
  ...overrides,
});

const repository = (candidates: ShiftOpsCandidateRecord[]): ShiftOpsRepository => ({
  findShift: async () => shift,
  listCandidateRecords: async () => candidates,
});

describe('ShiftOpsEligibilityService', () => {
  it('selects Liam and explains why Noah and Olivia are excluded', async () => {
    const service = new ShiftOpsEligibilityService(repository([
      candidate(),
      candidate({ employeeId: 'employee-noah', hasOverlap: true }),
      candidate({ employeeId: 'employee-olivia', hasApprovedLeave: true }),
    ]), { maxWeeklyMinutes: 2_400, requireRoleMatch: true });

    const result = await service.evaluate('shift-001');

    expect(result.shiftId).toBe('shift-001');
    expect(result.candidates).toEqual([
      expect.objectContaining({ employeeId: 'employee-liam', eligible: true, blockers: [] }),
      expect.objectContaining({ employeeId: 'employee-noah', eligible: false, blockers: ['SHIFT_OVERLAP'] }),
      expect.objectContaining({ employeeId: 'employee-olivia', eligible: false, blockers: ['APPROVED_LEAVE'] }),
    ]);
  });

  it('rejects inactive, unavailable, role-mismatched, and over-limit employees', async () => {
    const service = new ShiftOpsEligibilityService(repository([
      candidate({ employeeId: 'inactive', status: 'INACTIVE' }),
      candidate({ employeeId: 'unavailable', availability: null }),
      candidate({ employeeId: 'wrong-role', jobTitle: 'supervisor' }),
      candidate({ employeeId: 'over-limit', weeklyScheduledMinutes: 2_100 }),
    ]), { maxWeeklyMinutes: 2_400, requireRoleMatch: true });

    const result = await service.evaluate('shift-001');

    expect(result.candidates.map(({ employeeId, blockers }) => ({ employeeId, blockers }))).toEqual([
      { employeeId: 'inactive', blockers: ['EMPLOYEE_INACTIVE'] },
      { employeeId: 'over-limit', blockers: ['WEEKLY_HOURS_LIMIT'] },
      { employeeId: 'unavailable', blockers: ['AVAILABILITY_CONFLICT'] },
      { employeeId: 'wrong-role', blockers: ['ROLE_MISMATCH'] },
    ]);
  });

  it('ranks eligible employees by remaining weekly minutes then employee id', async () => {
    const service = new ShiftOpsEligibilityService(repository([
      candidate({ employeeId: 'employee-z', weeklyScheduledMinutes: 600 }),
      candidate({ employeeId: 'employee-b', weeklyScheduledMinutes: 0 }),
      candidate({ employeeId: 'employee-a', weeklyScheduledMinutes: 0 }),
    ]), { maxWeeklyMinutes: 2_400, requireRoleMatch: true });

    const result = await service.evaluate('shift-001');

    expect(result.candidates.map(({ employeeId, score }) => ({ employeeId, score }))).toEqual([
      { employeeId: 'employee-a', score: 1_920 },
      { employeeId: 'employee-b', score: 1_920 },
      { employeeId: 'employee-z', score: 1_320 },
    ]);
  });

  it('returns no candidates without inventing a recommendation', async () => {
    const service = new ShiftOpsEligibilityService(repository([]), {
      maxWeeklyMinutes: 2_400,
      requireRoleMatch: true,
    });

    await expect(service.evaluate('shift-001')).resolves.toEqual({ shiftId: 'shift-001', candidates: [] });
  });

  it('rejects missing or invalid shift records', async () => {
    const missing: ShiftOpsRepository = {
      findShift: async () => null,
      listCandidateRecords: async () => [],
    };
    await expect(new ShiftOpsEligibilityService(missing, {
      maxWeeklyMinutes: 2_400,
      requireRoleMatch: true,
    }).evaluate('missing')).rejects.toMatchObject({ code: 'SHIFT_NOT_FOUND' });

    const invalid: ShiftOpsRepository = {
      findShift: async () => ({ ...shift, endTime: '09:00' }),
      listCandidateRecords: async () => [],
    };
    await expect(new ShiftOpsEligibilityService(invalid, {
      maxWeeklyMinutes: 2_400,
      requireRoleMatch: true,
    }).evaluate('shift-001')).rejects.toMatchObject({ code: 'INVALID_SHIFT_TIME' });
  });
});
