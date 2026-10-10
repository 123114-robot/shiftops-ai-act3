import type { Prisma } from '@prisma/client';
import type { AuthUserRepository, AuthUserRecord } from '../services/AuthenticationService.js';
import { prisma } from './prisma.js';

const select = {
  id: true,
  email: true,
  passwordHash: true,
  role: true,
  employee: { select: { id: true } },
} as const;

type AuthUserQuery = Prisma.UserGetPayload<{ select: typeof select }>;

const mapUser = (user: AuthUserQuery | null): AuthUserRecord | null => {
  if (!user) return null;
  return { id: user.id, email: user.email, passwordHash: user.passwordHash, role: user.role, employeeId: user.employee?.id ?? null };
};

export class PrismaAuthUserRepository implements AuthUserRepository {
  async findByEmail(email: string) {
    return mapUser(await prisma.user.findUnique({ where: { email }, select }));
  }

  async findById(id: string) {
    return mapUser(await prisma.user.findUnique({ where: { id }, select }));
  }
}
