export type ShiftOpsEmployeeStatus = 'ACTIVE' | 'INACTIVE';

export type ShiftOpsShift = {
  id: string;
  employeeId: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  role: string;
};

export type ShiftOpsAvailability = {
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
};

export type ShiftOpsCandidateRecord = {
  employeeId: string;
  status: ShiftOpsEmployeeStatus;
  jobTitle: string;
  availability: ShiftOpsAvailability | null;
  hasApprovedLeave: boolean;
  hasOverlap: boolean;
  weeklyScheduledMinutes: number;
};

export interface ShiftOpsRepository {
  findShift(shiftId: string): Promise<ShiftOpsShift | null>;
  listCandidateRecords(shift: ShiftOpsShift): Promise<ShiftOpsCandidateRecord[]>;
}

export type ShiftOpsBlocker =
  | 'EMPLOYEE_INACTIVE'
  | 'AVAILABILITY_CONFLICT'
  | 'APPROVED_LEAVE'
  | 'SHIFT_OVERLAP'
  | 'ROLE_MISMATCH'
  | 'WEEKLY_HOURS_LIMIT';

export type ShiftOpsCandidateEvaluation = {
  employeeId: string;
  eligible: boolean;
  score: number;
  reasons: string[];
  blockers: ShiftOpsBlocker[];
};

export type ShiftOpsEligibilityPolicy = {
  maxWeeklyMinutes: number;
  requireRoleMatch: boolean;
};

export type ShiftOpsEligibilityErrorCode = 'SHIFT_NOT_FOUND' | 'INVALID_SHIFT_TIME';

export class ShiftOpsEligibilityError extends Error {
  constructor(public readonly code: ShiftOpsEligibilityErrorCode, message: string) {
    super(message);
  }
}

const roleMatches = (jobTitle: string, role: string) => (
  jobTitle.trim().toLowerCase() === role.trim().toLowerCase()
);

export class ShiftOpsEligibilityService {
  constructor(
    private readonly repository: ShiftOpsRepository,
    private readonly policy: ShiftOpsEligibilityPolicy,
  ) {
    if (!Number.isInteger(policy.maxWeeklyMinutes) || policy.maxWeeklyMinutes <= 0) {
      throw new Error('maxWeeklyMinutes must be a positive integer.');
    }
  }

  async evaluate(shiftId: string) {
    const shift = await this.repository.findShift(shiftId);
    if (!shift) {
      throw new ShiftOpsEligibilityError('SHIFT_NOT_FOUND', 'Shift not found.');
    }

    const startMinutes = parseStrictTime(shift.startTime);
    const endMinutes = parseStrictTime(shift.endTime);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      throw new ShiftOpsEligibilityError('INVALID_SHIFT_TIME', 'Shift end time must be later than start time.');
    }

    const shiftMinutes = endMinutes - startMinutes;
    const records = await this.repository.listCandidateRecords(shift);
    const candidates = records.map((record): ShiftOpsCandidateEvaluation => {
      const blockers: ShiftOpsBlocker[] = [];
      const availability = record.availability;

      if (record.status !== 'ACTIVE') blockers.push('EMPLOYEE_INACTIVE');
      if (
        !availability?.isAvailable
        || !availability.startTime
        || !availability.endTime
        || shift.startTime < availability.startTime
        || shift.endTime > availability.endTime
      ) blockers.push('AVAILABILITY_CONFLICT');
      if (record.hasApprovedLeave) blockers.push('APPROVED_LEAVE');
      if (record.hasOverlap) blockers.push('SHIFT_OVERLAP');
      if (this.policy.requireRoleMatch && !roleMatches(record.jobTitle, shift.role)) {
        blockers.push('ROLE_MISMATCH');
      }
      if (record.weeklyScheduledMinutes + shiftMinutes > this.policy.maxWeeklyMinutes) {
        blockers.push('WEEKLY_HOURS_LIMIT');
      }

      const eligible = blockers.length === 0;
      const reasons = eligible
        ? ['ACTIVE', 'AVAILABLE', 'NO_OVERLAP', 'NO_APPROVED_LEAVE', 'WITHIN_WEEKLY_LIMIT']
        : [];
      if (eligible && this.policy.requireRoleMatch) reasons.push('ROLE_MATCH');

      return {
        employeeId: record.employeeId,
        eligible,
        score: eligible
          ? this.policy.maxWeeklyMinutes - record.weeklyScheduledMinutes - shiftMinutes
          : 0,
        reasons,
        blockers,
      };
    });

    candidates.sort((left, right) => (
      Number(right.eligible) - Number(left.eligible)
      || right.score - left.score
      || left.employeeId.localeCompare(right.employeeId)
    ));

    return { shiftId: shift.id, candidates };
  }
}
import { parseStrictTime } from './BusinessTime.js';

