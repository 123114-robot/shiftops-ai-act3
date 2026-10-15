import type { AvailabilityInput, AvailabilityRepository } from '../services/AvailabilityService.js';
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
