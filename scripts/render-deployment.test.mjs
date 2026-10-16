import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Render blueprint defines the static site, API, database and safe configuration', async () => {
  const blueprint = await read('render.yaml');
  assert.match(blueprint, /name: shiftops-ai-web/);
  assert.match(blueprint, /runtime: static/);
  assert.match(blueprint, /staticPublishPath: \.\/frontend\/dist/);
  assert.match(blueprint, /name: shiftops-ai-api/);
  assert.match(blueprint, /healthCheckPath: \/api\/health/);
  assert.match(blueprint, /preDeployCommand: npm run db:deploy -w backend/);
  assert.match(blueprint, /name: shiftops-ai-db/);
  assert.match(blueprint, /key: DATABASE_URL[\s\S]*fromDatabase/);
  assert.match(blueprint, /key: JWT_SECRET[\s\S]*generateValue: true/);
  assert.match(blueprint, /key: DEMO_PASSWORD\s+sync: false/);
  assert.match(blueprint, /key: AI_MODE\s+value: deterministic/);
  assert.doesNotMatch(blueprint, /AI_API_KEY/);
});

test('production server uses Render PORT and binds publicly', async () => {
  const server = await read('backend/src/server.ts');
  assert.match(server, /process\.env\.PORT/);
  assert.match(server, /'0\.0\.0\.0'/);
});

test('deployment uses migrations and an additive guarded demo seed', async () => {
  const migration = await read('backend/prisma/migrations/20261016000000_initial/migration.sql');
  const seed = await read('backend/prisma/seed-demo.ts');
  assert.match(migration, /CREATE TABLE "User"/);
  assert.match(seed, /DEMO_SEED_ENABLED/);
  assert.match(seed, /process\.env\.DEMO_PASSWORD/);
  assert.doesNotMatch(seed, /ShiftFlow123!/);
  assert.match(seed, /demo-shift-incident/);
  assert.match(seed, /date: dateOnly\(0\)/);
  assert.match(seed, /upsert/);
  assert.doesNotMatch(seed, /deleteMany|drop|truncate/i);
});
