# Project Status

Last updated: 2026-10-11 (Asia/Shanghai)

## Current state

- Phase: 1 data and eligibility contract
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, branch `feature/phase-1-eligibility`; remote remains private
- Implemented: Phase 0 foundation plus read-only ShiftOps repository boundary, Prisma adapter, deterministic eligibility blockers, configurable role/hours rules, and deterministic ranking
- Not implemented: API wiring, proposal/approval workflow, mutations, audit persistence, UI, AI/AMD/Evolus integration, deployment, or submission packaging

## Validation

- `npm run test -w backend -- --run tests/shiftops-eligibility.service.test.ts`: PASS, 5 Phase 1 tests.
- `npm run test -w backend -- --run tests/health.test.ts`: PASS, 2 tests.
- `npm run lint`: PASS, backend and frontend.
- `npm run typecheck`: PASS, backend and frontend.
- `npm test`: PASS, 55 backend + 15 frontend tests; 1 database test skipped because `DATABASE_TESTS` was not enabled.
- `npm run build`: PASS, backend TypeScript and frontend Vite production build.
- `git diff --check`: PASS.

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- The public event page gives the online event dates but not an exact submission cutoff time/timezone.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- `npm ci` reported 9 dependency audit findings (1 moderate, 4 high, 4 critical); no automatic or breaking dependency upgrade was attempted in Phase 0. These require a targeted audit before release.

## Phase gate

Stop after Phase 1. The next phase requires explicit user approval after local verification. Phase 1 is not pushed automatically.
