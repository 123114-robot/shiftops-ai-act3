import { AvailabilityError, daysOfWeek, type AvailabilityInput, type AvailabilityRepository } from '../services/AvailabilityService.js';
import { prisma } from './prisma.js';
import { lockEmployeeSchedule, withSerializableRetry } from '../shiftops/SchedulingTransaction.js';

export class PrismaAvailabilityRepository implements AvailabilityRepository {
  async employeeExists(employeeId: string) {
    return (await prisma.employee.count({ where: { id: employeeId } })) > 0;
  }

  findByEmployeeId(employeeId: string) {
    return prisma.availability.findMany({ where: { employeeId }, orderBy: { dayOfWeek: 'asc' } });
  }

  async replaceWeekly(employeeId: string, entries: AvailabilityInput[]) {
    await withSerializableRetry(async tx => {
      await lockEmployeeSchedule(tx, employeeId);
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const assignedShifts = await tx.shift.findMany({
        where: { employeeId, status: { not: 'CANCELLED' }, date: { gte: today } },
        select: { date: true, startTime: true, endTime: true },
      });
      const replacementByDay = new Map(entries.map(entry => [entry.dayOfWeek, entry]));
      const conflicts = assignedShifts.some(shift => {
        const replacement = replacementByDay.get(daysOfWeek[(shift.date.getUTCDay() + 6) % 7]!);
        return !replacement?.isAvailable
          || !replacement.startTime
          || !replacement.endTime
          || shift.startTime < replacement.startTime
          || shift.endTime > replacement.endTime;
      });
      if (conflicts) {
        throw new AvailabilityError('SCHEDULE_CONFLICT', 'Availability conflicts with an existing assigned shift.');
      }
      for (const entry of entries) {
        await tx.availability.upsert({
          where: { employeeId_dayOfWeek: { employeeId, dayOfWeek: entry.dayOfWeek } },
          update: entry,
          create: { employeeId, ...entry },
        });
      }
    });
    return this.findByEmployeeId(employeeId);
  }
}
