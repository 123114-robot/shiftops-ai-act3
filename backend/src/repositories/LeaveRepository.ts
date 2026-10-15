import { Prisma } from '@prisma/client';
import { LeaveError, type LeaveRepository } from '../services/LeaveService.js';
import { lockEmployeeSchedule, withSerializableRetry } from '../shiftops/SchedulingTransaction.js';
import { prisma } from './prisma.js';

export function throwMappedLeaveReviewError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
    throw new LeaveError('CONCURRENT_REVIEW', 'Leave review could not complete because of concurrent updates.');
  }
  throw error;
}

export class PrismaLeaveRepository implements LeaveRepository {
  listForEmployee(employeeId: string) {
    return prisma.leaveRequest.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  listAll() {
    return prisma.leaveRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: string) {
    return prisma.leaveRequest.findUnique({ where: { id } });
  }

  create(input: Parameters<LeaveRepository['create']>[0]) {
    return prisma.leaveRequest.create({ data: input });
  }

  async review(id: string, status: 'APPROVED' | 'REJECTED', reviewedById: string) {
    try {
      return await withSerializableRetry(async tx => {
        const request = await tx.leaveRequest.findUniqueOrThrow({ where: { id } });
        if (request.status !== 'PENDING') {
          throw new LeaveError('LEAVE_ALREADY_REVIEWED', 'Leave request has already been reviewed.');
        }
        if (status === 'APPROVED') {
          await lockEmployeeSchedule(tx, request.employeeId);
          const conflicts = await tx.shift.count({
            where: {
              employeeId: request.employeeId,
              status: { not: 'CANCELLED' },
              date: { gte: request.startDate, lte: request.endDate },
            },
          });
          if (conflicts > 0) {
            throw new LeaveError('SCHEDULE_CONFLICT', 'Approved leave conflicts with an existing assigned shift.');
          }
        }
        const updated = await tx.leaveRequest.updateMany({
          where: { id, status: 'PENDING' },
          data: { status, reviewedById, reviewedAt: new Date() },
        });
        if (updated.count !== 1) {
          throw new LeaveError('LEAVE_ALREADY_REVIEWED', 'Leave request has already been reviewed.');
        }
        return tx.leaveRequest.findUniqueOrThrow({ where: { id } });
      });
    } catch (error) {
      throwMappedLeaveReviewError(error);
    }
  }
}
