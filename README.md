# ShiftOps AI

ShiftOps AI is a human-approved workforce scheduling assistant built on the existing ShiftFlow application. Phase 4 adds a minimal Manager UI for the incident-to-audit demo while preserving backend-owned eligibility, approval, and schedule mutation.

## Source and status

- Product: ShiftOps AI — Autonomous Workforce Operations Assistant
- Team: Synqvera Labs
- Source snapshot: `123114-robot/ShiftFlow`, commit `6ea907b742c547bd8e8941e64afddf089daf733f`
- Source branch at snapshot: `codex/phase-9-basic-dashboard`
- Current delivery state: Phase 4 minimal Manager UI; AMD inference not yet verified and project not submission-ready

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
- `POST /api/shiftops/incidents/:id/evaluate`
- `POST /api/shiftops/proposals`
- `POST /api/shiftops/proposals/:id/approve`
- `POST /api/shiftops/proposals/:id/reject`
- `POST /api/shiftops/proposals/:id/apply`
- `GET /api/shiftops/proposals/:id`
- `GET /api/shiftops/audit`

Run `npm run db:push` after pulling Phase 2 schema changes. Applying a proposal updates the shift, resolves the incident, advances the proposal version, and writes the audit event in one Prisma transaction.

After signing in as a Manager, open `/shiftops` (or use the dashboard link), enter an existing shift ID and reason, compare eligible and blocked candidates, create a proposal, approve it, apply it, and inspect the returned audit history. The UI never bypasses the explicit approval step.

For the complete preserved application, start PostgreSQL with `docker compose up -d postgres`, then run `npm run db:push` and `npm run db:seed`. Never use sample credentials outside local development.

## Environment contract

`AI_MODE=deterministic` uses only validated facts and requires no provider. `AI_MODE=remote` calls `${AI_BASE_URL}/chat/completions` with `AI_API_KEY`, `AI_MODEL`, and `AI_TIMEOUT_SECONDS`. Configuration stays server-side. Remote output must return JSON containing the same `employeeId` and exact validated `reasonCodes`; invalid, mismatched, empty, oversized, failed, or timed-out responses fall back deterministically. No paid API was called, and the AMD path remains **NOT TESTED** until a real approved endpoint is exercised.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

See `docs/STATUS.md` for verified results and blockers, and `docs/COMPETITION_REQUIREMENTS.md` for the evidence-bounded competition audit.

Phase 5 submission preparation is in `docs/SUBMISSION_CHECKLIST.md`, `docs/SUBMISSION_DRAFT.md`, `docs/DEMO_SCRIPT.md`, and `docs/RUNTIME_EVIDENCE_TEMPLATE.md`. Run `npm run test:readiness` and `npm run submission:check` to inspect the evidence gate; the checker never prints credential values.
