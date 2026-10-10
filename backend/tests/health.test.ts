import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

describe('GET /api/health', () => {
  it('reports that the API is healthy', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'shiftflow-api' });
  });
});

describe('GET /api/shiftops/health', () => {
  it('reports the ShiftOps foundation status without requiring a database', async () => {
    const response = await request(app).get('/api/shiftops/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'shiftops-api',
      phase: 0,
    });
  });
});
