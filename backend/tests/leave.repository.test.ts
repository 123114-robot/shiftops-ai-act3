import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { throwMappedLeaveReviewError } from '../src/repositories/LeaveRepository.js';

describe('leave repository error mapping', () => {
  it('maps exhausted serializable conflicts to a stable leave conflict', () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('serialization conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });
    expect(() => throwMappedLeaveReviewError(conflict)).toThrow(
      expect.objectContaining({ code: 'CONCURRENT_REVIEW' }),
    );
  });

  it('preserves unrelated repository failures', () => {
    const failure = new Error('database unavailable');
    expect(() => throwMappedLeaveReviewError(failure)).toThrow(failure);
  });
});
