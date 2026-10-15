import type {
  ShiftOpsCandidateRecord,
  ShiftOpsRepository,
  ShiftOpsShift,
} from './ShiftOpsEligibilityService.js';
import { prisma } from '../repositories/prisma.js';
import { businessDayOfWeek, parseStrictTime, startOfBusinessWeek } from './BusinessTime.js';
import type { TransactionClient } from './SchedulingTransaction.js';

type ShiftOpsDb = Pick<TransactionClient, 'shift' | 'employee'>;

export class PrismaShiftOpsRepository implements ShiftOpsRepository {
  constructor(private readonly db: ShiftOpsDb = prisma) {}

  findShift(shiftId: string) {
    return this.db.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true,
        employeeId: true,
        date: true,
        startTime: true,
        endTime: true,
        role: true,
      },
    });
  }

  async listCandidateRecords(shift: ShiftOpsShift): Promise<ShiftOpsCandidateRecord[]> {
    const weekStart = startOfBusinessWeek(shift.date);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    const employees = await this.db.employee.findMany({
      select: {
        id: true,
        status: true,
        jobTitle: true,
        availability: {
          where: { dayOfWeek: businessDayOfWeek(shift.date) },
          select: { isAvailable: true, startTime: true, endTime: true },
        },
        leaveRequests: {
          where: {
            status: 'APPROVED',
            startDate: { lte: shift.date },
            endDate: { gte: shift.date },
          },
          select: { id: true },
        },
        shifts: {
          where: {
            id: { not: shift.id },
            status: { not: 'CANCELLED' },
            date: { gte: weekStart, lte: weekEnd },
          },
          select: { date: true, startTime: true, endTime: true },
        },
      },
    });

    return employees.map((employee) => ({
      employeeId: employee.id,
      status: employee.status,
      jobTitle: employee.jobTitle,
      availability: employee.availability[0] ?? null,
      hasApprovedLeave: employee.leaveRequests.length > 0,
      hasOverlap: employee.shifts.some((assignedShift) => (
        assignedShift.date.getTime() === shift.date.getTime()
        && assignedShift.startTime < shift.endTime
        && assignedShift.endTime > shift.startTime
      )),
      weeklyScheduledMinutes: employee.shifts.reduce((total, assignedShift) => {
        const start = parseStrictTime(assignedShift.startTime);
        const end = parseStrictTime(assignedShift.endTime);
        if (start === null || end === null || start >= end) {
          throw new Error(`Shift ${assignedShift.date.toISOString()} has invalid stored time.`);
        }
        return total + end - start;
      }, 0),
    }));
  }
}
