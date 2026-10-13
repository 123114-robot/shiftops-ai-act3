import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { lockEmployeeSchedules, withSerializableRetry } from '../src/shiftops/SchedulingTransaction.js';

describe('serializable scheduling transactions', () => {
  it('locks unique employee schedules in deterministic order', async () => {
    const executeRaw = vi.fn().mockResolvedValue(1);
    await lockEmployeeSchedules({ $executeRaw: executeRaw } as never, ['employee-z', null, 'employee-a', 'employee-z']);
    expect(executeRaw.mock.calls.map(call => call[1])).toEqual(['employee-a', 'employee-z']);
  });

  it('retries the full operation for P2034 at most three times', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('conflict', { code: 'P2034', clientVersion: 'test' });
    const transaction = vi.fn()
      .mockRejectedValueOnce(conflict)
      .mockRejectedValueOnce(conflict)
      .mockResolvedValueOnce('applied');
    const action = vi.fn(async () => 'unused');
    await expect(withSerializableRetry(action, { $transaction: transaction } as never)).resolves.toBe('applied');
    expect(transaction).toHaveBeenCalledTimes(3);
    expect(transaction.mock.calls.every(call => call[0] === action)).toBe(true);
  });

  it('does not retry non-serialization failures', async () => {
    const transaction = vi.fn().mockRejectedValue(new Error('validation failed'));
    await expect(withSerializableRetry(async () => undefined, { $transaction: transaction } as never)).rejects.toThrow('validation failed');
    expect(transaction).toHaveBeenCalledOnce();
  });
});
