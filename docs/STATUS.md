# Project Status

Last updated: 2026-10-12 (Australia/Sydney)

## Current state

- Phase: 3 grounded explanation provider
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, branch `feature/phase-3-grounded-explanations`; remote remains private
- Implemented: Phases 0–2 plus deterministic and OpenAI-compatible grounded explanation providers with safe fallback
- Not implemented: UI, verified AMD/Evolus integration, notifications, deployment, or submission packaging

## Validation

- `npm run test -w backend -- --run tests/shiftops-eligibility.service.test.ts`: PASS, 5 Phase 1 tests.
- Phase 2 focused service/route tests: PASS, 8 tests.
- Phase 2 PostgreSQL transaction test: NOT RUN locally; Docker Desktop engine was unavailable. Test is present and enabled in CI with `DATABASE_TESTS=true`.
- Phase 3 provider tests: PASS, 5 tests covering deterministic output, compatible remote output, candidate mismatch, invented/omitted reasons, malformed output, provider failure, and timeout fallback.
- `npm run test -w backend -- --run tests/health.test.ts`: PASS, 2 tests.
- `npm run lint`: PASS, backend and frontend.
- `npm run typecheck`: PASS, backend and frontend.
- `npm test`: PASS, 68 backend + 15 frontend tests; 2 database tests skipped because `DATABASE_TESTS` was not enabled.
- `npm run build`: PASS, backend TypeScript and frontend Vite production build.
- `git diff --check`: PASS.

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- The public event page gives the online event dates but not an exact submission cutoff time/timezone.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- AMD adapter status: NOT TESTED against real AMD infrastructure; mocked OpenAI-compatible tests are not compliance evidence.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- `npm ci` reported 9 dependency audit findings (1 moderate, 4 high, 4 critical); no automatic or breaking dependency upgrade was attempted in Phase 0. These require a targeted audit before release.
- Target-shift and proposal concurrency are guarded by `updatedAt`, status, and version. Candidate availability/leave/overlap are revalidated immediately before the transaction, but a narrow cross-transaction eligibility race remains until database-level locking or equivalent scheduling serialization is introduced.

## Phase gate

Stop after Phase 3. The next phase requires explicit user approval after local verification. Phase 3 is not pushed automatically.
