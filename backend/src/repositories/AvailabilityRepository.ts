import type { AvailabilityInput, AvailabilityRepository } from '../services/AvailabilityService.js';
import { prisma } from './prisma.js';

export class PrismaAvailabilityRepository implements AvailabilityRepository {
  async employeeExists(employeeId: string) {
    return (await prisma.employee.count({ where: { id: employeeId } })) > 0;
  }

  findByEmployeeId(employeeId: string) {
    return prisma.availability.findMany({ where: { employeeId }, orderBy: { dayOfWeek: 'asc' } });
  }

  async replaceWeekly(employeeId: string, entries: AvailabilityInput[]) {
    await prisma.$transaction(entries.map((entry) => prisma.availability.upsert({
      where: { employeeId_dayOfWeek: { employeeId, dayOfWeek: entry.dayOfWeek } },
      update: entry,
      create: { employeeId, ...entry },
    })));
    return this.findByEmployeeId(employeeId);
  }
}
