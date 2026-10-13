import { Prisma, type PrismaClient } from '@prisma/client';
import { prisma } from '../repositories/prisma.js';

export type TransactionClient = Prisma.TransactionClient;

export async function lockEmployeeSchedule(tx: TransactionClient, employeeId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${employeeId}))`;
}

export async function withSerializableRetry<T>(
  action: (tx: TransactionClient) => Promise<T>,
  client: Pick<PrismaClient, '$transaction'> = prisma,
  maxAttempts = 3,
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await client.$transaction(action, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
      if (!retryable || attempt === maxAttempts) throw error;
    }
  }
  throw new Error('Serializable transaction retry limit exhausted.');
}
