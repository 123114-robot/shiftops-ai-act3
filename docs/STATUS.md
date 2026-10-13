# Project Status

Last updated: 2026-10-13 (Australia/Sydney)

## Current state

- Phase: 5 submission readiness and evidence gate
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, public GitHub repository; working branch `feature/phase-5-submission-readiness`
- Implemented: Phases 0–4 plus submission-readiness checker and evidence-bounded submission package
- Not implemented: verified AMD/Evolus runtime integration, deployment, video, deck, or portal submission

## Validation

- `npm run test -w backend -- --run tests/shiftops-eligibility.service.test.ts`: PASS, 5 Phase 1 tests.
- Phase 2 focused service/route tests: PASS, 8 tests.
- Phase 2 PostgreSQL transaction test: NOT RUN locally; Docker Desktop engine was unavailable. Test is present and enabled in CI with `DATABASE_TESTS=true`.
- Phase 3 provider tests: PASS, 5 tests covering deterministic output, compatible remote output, candidate mismatch, invented/omitted reasons, malformed output, provider failure, and timeout fallback.
- Phase 4 focused tests: PASS, 10 backend service/route tests and 16 frontend application tests.
- `npm run test -w backend -- --run tests/health.test.ts`: PASS, 2 tests.
- `npm run lint`: PASS, backend and frontend.
- `npm run typecheck`: PASS, backend and frontend.
- `npm test`: PASS, 70 backend + 16 frontend tests; 2 database tests skipped because `DATABASE_TESTS` was not enabled.
- `npm run build`: PASS, backend TypeScript and frontend Vite production build.
- `npm run db:validate -w backend`: PASS with a temporary local-format `DATABASE_URL`; schema validation made no database connection.
- `git diff --check`: PASS.
- Phase 5 readiness checker tests: PASS, 3 tests; secret values are neither returned nor printed.
- `npm run submission:check` with verified public-repository flag: BLOCKED as expected because AMD configuration/runtime evidence and submission assets are absent.
- Phase 5 full regression: PASS, 70 backend and 16 frontend tests; lint, typecheck, build, Prisma schema validation, and diff check passed. Two PostgreSQL integration tests remained skipped because no database engine was available.

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- Public pages conflict: overview says online build ends 18 October, while the live page says 17 October. Exact cutoff time/timezone remains unverified.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- AMD adapter status: NOT TESTED against real AMD infrastructure; mocked OpenAI-compatible tests are not compliance evidence.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- GitHub detects no license for this repository or its ShiftFlow source; ownership and MIT-compatibility must be resolved before submission.
- `npm ci` reported 9 dependency audit findings (1 moderate, 4 high, 4 critical); no automatic or breaking dependency upgrade was attempted in Phase 0. These require a targeted audit before release.
- Target-shift and proposal concurrency are guarded by `updatedAt`, status, and version. Candidate availability/leave/overlap are revalidated immediately before the transaction, but a narrow cross-transaction eligibility race remains until database-level locking or equivalent scheduling serialization is introduced.

## Phase gate

Stop after Phase 5. Real AMD/Evolus execution, deployment, or submission requires the missing external access/evidence and a new explicit approval. Phase 5 is not pushed automatically.
