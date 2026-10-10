import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/repositories/prisma.js';

const databaseDescribe = process.env.DATABASE_TESTS === 'true' ? describe : describe.skip;

databaseDescribe('database integration', () => {
  afterAll(async () => prisma.$disconnect());

  it('connects to PostgreSQL through Prisma', async () => {
    const result = await prisma.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;
    expect(result[0]?.value).toBe(1);
  });
});
