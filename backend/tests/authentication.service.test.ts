import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { AuthenticationService, type AuthUserRepository } from '../src/services/AuthenticationService.js';

const passwordHash = await bcrypt.hash('ShiftFlow123!', 4);
const manager = { id: 'manager-1', email: 'manager@shiftflow.local', passwordHash, role: 'MANAGER' as const, employeeId: null };
const repository: AuthUserRepository = {
  findByEmail: async (email) => email === manager.email ? manager : null,
  findById: async (id) => id === manager.id ? manager : null,
};

describe('AuthenticationService', () => {
  const service = new AuthenticationService(repository, 'test-secret-at-least-32-characters');

  it('returns a token and safe user for valid credentials', async () => {
    const result = await service.login(manager.email, 'ShiftFlow123!');
    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toEqual({ id: manager.id, email: manager.email, role: 'MANAGER', employeeId: null });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('uses the same invalid credentials error for unknown email and bad password', async () => {
    await expect(service.login('missing@shiftflow.local', 'wrong')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    await expect(service.login(manager.email, 'wrong')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('resolves the current user from a signed token', async () => {
    const { token } = await service.login(manager.email, 'ShiftFlow123!');
    await expect(service.getCurrentUser(token)).resolves.toMatchObject({ id: manager.id, role: 'MANAGER' });
  });
});
