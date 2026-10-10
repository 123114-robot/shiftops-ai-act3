import type {
  ShiftOpsCandidateRecord,
  ShiftOpsRepository,
  ShiftOpsShift,
} from './ShiftOpsEligibilityService.js';
import { prisma } from '../repositories/prisma.js';

const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const startOfUtcWeek = (date: Date) => {
  const start = new Date(date);
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

export class PrismaShiftOpsRepository implements ShiftOpsRepository {
  findShift(shiftId: string) {
    return prisma.shift.findUnique({
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
    const weekStart = startOfUtcWeek(shift.date);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        status: true,
        jobTitle: true,
        availability: {
          where: { dayOfWeek: days[shift.date.getUTCDay()] },
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
      weeklyScheduledMinutes: employee.shifts.reduce((total, assignedShift) => (
        total + timeToMinutes(assignedShift.endTime) - timeToMinutes(assignedShift.startTime)
      ), 0),
    }));
  }
}
