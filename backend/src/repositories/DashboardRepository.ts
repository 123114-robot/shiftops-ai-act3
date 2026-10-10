import type { DashboardRepository } from '../services/DashboardService.js';
import { prisma } from './prisma.js';

export class PrismaDashboardRepository implements DashboardRepository {
  async countWorking(date: Date) {
    const rows = await prisma.shift.findMany({
      where: { date, status: 'SCHEDULED', employeeId: { not: null } },
      select: { employeeId: true },
      distinct: ['employeeId'],
    });
    return rows.length;
  }

  countUnfilled(start: Date, end: Date) {
    return prisma.shift.count({
      where: { date: { gte: start, lte: end }, status: { not: 'CANCELLED' }, employeeId: null },
    });
  }

  countApprovedLeave(date: Date) {
    return prisma.leaveRequest.count({
      where: { status: 'APPROVED', startDate: { lte: date }, endDate: { gte: date } },
    });
  }

  listScheduledWindows(start: Date, end: Date) {
    return prisma.shift.findMany({
      where: { date: { gte: start, lte: end }, status: 'SCHEDULED' },
      select: { startTime: true, endTime: true },
    });
  }
}
