# Project Status

Last updated: 2026-10-10 (Asia/Taipei)

## Current state

- Phase: 0 foundation
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, branch `feature/phase-0-foundation`, no remote configured
- Implemented: docs/environment foundation, synthetic fixture, ShiftOps health route and focused test
- Not implemented: all business workflows, AI/AMD/Evolus integration, deployment, submission packaging

## Validation

- `npm run test -w backend -- --run tests/health.test.ts`: PASS, 2 tests.
- `npm run lint`: PASS, backend and frontend.
- `npm run typecheck`: PASS, backend and frontend.
- `npm test`: PASS, 50 backend + 15 frontend tests; 1 database test skipped because `DATABASE_TESTS` was not enabled.
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

Stop after Phase 0. Phase 1 requires explicit user approval after local verification.
