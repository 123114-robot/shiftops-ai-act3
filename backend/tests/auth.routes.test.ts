import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAuthRouter } from '../src/routes/auth.js';
import { authenticate, requireRole } from '../src/middleware/auth.js';
import { AuthenticationService, type AuthUserRepository } from '../src/services/AuthenticationService.js';
import bcrypt from 'bcryptjs';

const secret = 'test-secret-at-least-32-characters';
const passwordHash = await bcrypt.hash('ShiftFlow123!', 4);
const users = [
  { id: 'manager-1', email: 'manager@shiftflow.local', passwordHash, role: 'MANAGER' as const, employeeId: null },
  { id: 'employee-1', email: 'barry@shiftflow.local', passwordHash, role: 'EMPLOYEE' as const, employeeId: 'barry-1' },
];
const repository: AuthUserRepository = {
  findByEmail: async (email) => users.find((user) => user.email === email) ?? null,
  findById: async (id) => users.find((user) => user.id === id) ?? null,
};
const service = new AuthenticationService(repository, secret);
const app = express();
app.use(express.json());
app.use('/api/auth', createAuthRouter(service));
app.get('/manager-only', authenticate(service), requireRole('MANAGER'), (_req, res) => res.json({ ok: true }));

describe('auth routes', () => {
  it('logs in and returns the current user from a bearer token', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: users[0].email, password: 'ShiftFlow123!' });
    expect(login.status).toBe(200);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(users[0].email);
  });

  it('rejects invalid login input and unauthenticated access', async () => {
    expect((await request(app).post('/api/auth/login').send({ email: 'bad', password: '' })).status).toBe(400);
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('forbids an employee from a manager-only route', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: users[1].email, password: 'ShiftFlow123!' });
    const response = await request(app).get('/manager-only').set('Authorization', `Bearer ${login.body.token}`);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});
