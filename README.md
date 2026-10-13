# ShiftOps AI

ShiftOps AI is a human-approved workforce scheduling assistant built on the existing ShiftFlow application. Phase 2 adds a Manager-only incident and proposal API with explicit approval/rejection, apply-time eligibility revalidation, optimistic concurrency, one-time schedule application, and audit persistence. AI inference and UI are not implemented yet.

## Source and status

- Product: ShiftOps AI — Autonomous Workforce Operations Assistant
- Team: Synqvera Labs
- Source snapshot: `123114-robot/ShiftFlow`, commit `6ea907b742c547bd8e8941e64afddf089daf733f`
- Source branch at snapshot: `codex/phase-9-basic-dashboard`
- Current delivery state: Phase 2 proposal workflow; not submission-ready

The source snapshot uses React, TypeScript, Vite, Express, Prisma, PostgreSQL, Vitest, Supertest, and GitHub Actions. Its existing authentication, RBAC, scheduling rules, leave, roster, and dashboard logic are preserved.

## Setup

Prerequisites: Node.js 20.19+ (CI uses Node 22), npm, and Docker Desktop for database-backed flows.

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
npm ci
npm run db:generate
npm run test -w backend -- --run tests/health.test.ts
npm run dev
```

Health endpoints:

- Existing ShiftFlow: `GET http://localhost:3000/api/health`
- Phase 0 ShiftOps: `GET http://localhost:3000/api/shiftops/health`

Phase 1 eligibility is intentionally an internal service. It checks active status, full-shift availability, approved leave, overlaps, optional exact role match, and a configurable weekly-minute limit. Eligible candidates are ranked by remaining weekly minutes after the proposed shift, then by `employeeId` for deterministic ties.

Phase 2 Manager-only endpoints:

- `POST /api/shiftops/incidents`
- `POST /api/shiftops/proposals`
- `POST /api/shiftops/proposals/:id/approve`
- `POST /api/shiftops/proposals/:id/reject`
- `POST /api/shiftops/proposals/:id/apply`
- `GET /api/shiftops/proposals/:id`
- `GET /api/shiftops/audit`

Run `npm run db:push` after pulling Phase 2 schema changes. Applying a proposal updates the shift, resolves the incident, advances the proposal version, and writes the audit event in one Prisma transaction.

For the complete preserved application, start PostgreSQL with `docker compose up -d postgres`, then run `npm run db:push` and `npm run db:seed`. Never use sample credentials outside local development.

## Environment contract

`AI_MODE=deterministic` is the only Phase 0 mode. `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, and `AI_TIMEOUT_SECONDS` reserve a server-side provider contract for a later authorized phase. No paid API or AMD/Evolus integration is active, and secrets must not be exposed to the frontend or committed.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

See `docs/STATUS.md` for verified results and blockers, and `docs/COMPETITION_REQUIREMENTS.md` for the evidence-bounded competition audit.
