import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAvailabilityRouter, createManagerAvailabilityRouter } from '../src/routes/availability.js';
import { AuthenticationService, type AuthUserRepository } from '../src/services/AuthenticationService.js';
import { AvailabilityService, type AvailabilityRepository } from '../src/services/AvailabilityService.js';

const hash = await bcrypt.hash('ShiftFlow123!', 4);
const users = [
  { id: 'm', email: 'manager@test.local', passwordHash: hash, role: 'MANAGER' as const, employeeId: null },
  { id: 'u', email: 'employee@test.local', passwordHash: hash, role: 'EMPLOYEE' as const, employeeId: 'e1' },
];
const authRepository: AuthUserRepository = {
  findByEmail: async (email) => users.find((user) => user.email === email) ?? null,
  findById: async (id) => users.find((user) => user.id === id) ?? null,
};
const stored = [{ id: 'a1', employeeId: 'e1', dayOfWeek: 'MONDAY' as const, startTime: '09:00', endTime: '17:00', isAvailable: true }];
const availabilityRepository: AvailabilityRepository = {
  employeeExists: async (id) => id === 'e1',
  findByEmployeeId: async () => stored,
  replaceWeekly: async (employeeId, entries) => entries.map((entry, index) => ({ id: `a${index}`, employeeId, ...entry })),
};
const auth = new AuthenticationService(authRepository, 'test-secret-at-least-32-characters');
const availability = new AvailabilityService(availabilityRepository);
const app = express();
app.use(express.json());
app.use('/api/availability', createAvailabilityRouter(auth, availability));
app.use('/api/employees', createManagerAvailabilityRouter(auth, availability));

const week = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: dayOfWeek === 'TUESDAY' ? null : '09:00',
  endTime: dayOfWeek === 'TUESDAY' ? null : '17:00',
  isAvailable: dayOfWeek !== 'TUESDAY',
}));
async function token(email: string) { return (await auth.login(email, 'ShiftFlow123!')).token; }

describe('availability routes', () => {
  it('allows an employee to read and replace only their own recurring week', async () => {
    const bearer = await token(users[1]!.email);
    expect((await request(app).get('/api/availability/me').set('Authorization', `Bearer ${bearer}`)).status).toBe(200);
    const response = await request(app).put('/api/availability/me').set('Authorization', `Bearer ${bearer}`).send({ availability: week });
    expect(response.status).toBe(200);
    expect(response.body.availability).toHaveLength(7);
  });

  it('allows managers to read employee availability but not use the employee self-service endpoint', async () => {
    const bearer = await token(users[0]!.email);
    expect((await request(app).get('/api/employees/e1/availability').set('Authorization', `Bearer ${bearer}`)).status).toBe(200);
    expect((await request(app).put('/api/availability/me').set('Authorization', `Bearer ${bearer}`).send({ availability: week })).status).toBe(403);
  });

  it('forbids employees from reading another employee through the manager endpoint', async () => {
    const bearer = await token(users[1]!.email);
    const response = await request(app).get('/api/employees/e1/availability').set('Authorization', `Bearer ${bearer}`);
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects incomplete, duplicate, and invalid time ranges', async () => {
    const bearer = await token(users[1]!.email);
    const invalid = week.map((entry, index) => index === 1 ? { ...entry, dayOfWeek: 'MONDAY' } : entry);
    invalid[0] = { ...invalid[0]!, startTime: '18:00', endTime: '09:00' };
    const response = await request(app).put('/api/availability/me').set('Authorization', `Bearer ${bearer}`).send({ availability: invalid });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
