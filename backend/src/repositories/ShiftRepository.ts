import { Prisma } from '@prisma/client';
import { SchedulingError, SchedulingService } from '../services/SchedulingService.js';
import { ShiftError, type ShiftRepository } from '../services/ShiftService.js';
import { lockEmployeeSchedules, withSerializableRetry } from '../shiftops/SchedulingTransaction.js';
import { prisma } from './prisma.js';
import { PrismaSchedulingRepository } from './SchedulingRepository.js';

function mapWriteConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
    throw new SchedulingError(
      'CONCURRENT_SCHEDULE_UPDATE',
      'The schedule changed concurrently. Reload and try again.',
    );
  }
  throw error;
}

export class PrismaShiftRepository implements ShiftRepository {
  listByDateRange(start: Date, end: Date) {
    return prisma.shift.findMany({ where: { date: { gte: start, lte: end } }, orderBy: [{ date: 'asc' }, { startTime: 'asc' }] });
  }

  findById(id: string) {
    return prisma.shift.findUnique({ where: { id } });
  }

  async createValidated(input: Parameters<ShiftRepository['createValidated']>[0]) {
    try {
      return await withSerializableRetry(async tx => {
        await lockEmployeeSchedules(tx, [input.employeeId]);
        await new SchedulingService(new PrismaSchedulingRepository(tx)).validate({
          employeeId: input.employeeId ?? null,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
        });
        return tx.shift.create({ data: input });
      });
    } catch (error) {
      return mapWriteConflict(error);
    }
  }

  async updateValidated(id: string, input: Parameters<ShiftRepository['updateValidated']>[1]) {
    try {
      return await withSerializableRetry(async tx => {
        const initial = await tx.shift.findUnique({ where: { id } });
        if (!initial) throw new ShiftError('NOT_FOUND', 'Shift not found.');
        const nextEmployeeId = input.employeeId === undefined ? initial.employeeId : input.employeeId;
        await lockEmployeeSchedules(tx, [initial.employeeId, nextEmployeeId]);

        const current = await tx.shift.findUnique({ where: { id } });
        if (!current) throw new ShiftError('NOT_FOUND', 'Shift not found.');
        await new SchedulingService(new PrismaSchedulingRepository(tx)).validate({
          employeeId: input.employeeId === undefined ? current.employeeId : input.employeeId,
          date: input.date ?? current.date,
          startTime: input.startTime ?? current.startTime,
          endTime: input.endTime ?? current.endTime,
        }, id);
        return tx.shift.update({ where: { id }, data: input });
      });
    } catch (error) {
      return mapWriteConflict(error);
    }
  }

  async cancelValidated(id: string) {
    try {
      return await withSerializableRetry(async tx => {
        const initial = await tx.shift.findUnique({ where: { id } });
        if (!initial) throw new ShiftError('NOT_FOUND', 'Shift not found.');
        await lockEmployeeSchedules(tx, [initial.employeeId]);
        return tx.shift.update({ where: { id }, data: { status: 'CANCELLED' } });
      });
    } catch (error) {
      return mapWriteConflict(error);
    }
  }
}
