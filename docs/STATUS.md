# Project Status

Last updated: 2026-10-16 (Australia/Sydney)

## Current state

- Phase: 9 reproducible competition demo evidence
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, public GitHub repository; working branch `feature/phase-9-demo-readiness`
- Implemented: Phases 0–5 plus CI coverage, strict business-time handling, transaction-scoped proposal revalidation, constrained explanations, typed error mapping, reject UI, provenance and audit hardening
- Implemented in Phase 7: official Token Factory endpoint contract, explicit provider/source labels, response-model provenance validation, sanitized inference trace, and reproducible synthetic evidence command
- Implemented locally in Phase 8: ordinary shift create/update/reassignment/unassignment/cancel now validate and persist inside the shared employee-lock and Serializable transaction boundary
- Remediated after the Phase 8 independent audit: leave review now performs an atomic pending-state transition and maps exhausted serialization conflicts without weakening Manager authorization or schedule-conflict checks
- Implemented locally in Phase 9: a self-cleaning synthetic PostgreSQL evidence command that verifies the full incident-to-audit workflow and measures the backend-derived unfilled-shift delta without claiming AMD execution
- Not verified: successful live AMD request (credentials/model unavailable), AMD account/hardware evidence, Evolus, deployment, video, deck, or portal submission

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
- Phase 6 local unit/route tests: PASS, 78 backend tests and 17 frontend tests.
- Phase 6 readiness tests: PASS, 4 tests.
- Phase 6 local PostgreSQL integration/concurrency: BLOCKED; 3 tests skipped because the Docker Desktop Linux engine pipe was unavailable.
- GitHub CI run `38382593504`: PASS. PostgreSQL initialized successfully with `DATABASE_TESTS=true`; backend 81/81, frontend 17/17, and readiness 4/4 tests passed with zero skipped. Lint, typecheck and build passed. Run: `https://github.com/123114-robot/shiftops-ai-act3/actions/runs/38382593504`.
- Phase 6 lint, typecheck, production build, Prisma schema validation, and `git diff --check`: PASS.
- npm audit after safe non-forced fixes: full tree 6 findings (1 moderate, 3 high, 2 critical); production-only 3 high findings. See `docs/NPM_AUDIT.md`.
- Phase 7 focused explanation tests: PASS, 8 tests including AMD request shape, model provenance, mock labelling, and fallback behavior.
- Phase 7 readiness tests: PASS, 5 tests including rejection of generic remote providers as AMD evidence.
- Phase 7 full local regression: PASS, 80 backend and 17 frontend tests; 3 PostgreSQL tests skipped because the Docker Desktop Linux engine was unavailable.
- Phase 7 lint, typecheck, production build, Prisma client generation, and `git diff --check`: PASS.
- Phase 7 submission readiness: BLOCKED as expected because runtime AMD evidence, public-repository environment evidence, and submission assets are absent.
- Phase 7 live AMD verification: BLOCKED; the safe verification command refused to run without `AI_API_KEY` and `AI_MODEL` and printed no secret values. See `docs/AMD_TOKEN_FACTORY.md`.
- Phase 8 focused tests: PASS, 19 unit/route/transaction tests including deterministic multi-employee lock ordering.
- Phase 8 initial non-database regression: PASS, 81 backend and 17 frontend tests; database tests were initially skipped before Docker Desktop was started.
- Phase 8 lint, typecheck, production build, and `git diff --check`: PASS.
- Phase 8 PostgreSQL verification: PASS, schema synchronized with the local disposable database and all 88 backend tests passed with zero skips; frontend 17/17 also passed.
- Phase 8 race stability: PASS, the six-test proposal/database suite—including ordinary create/reassignment, availability reduction, and leave approval cross-route races—passed five consecutive runs before the final full regression.
- Phase 8 conflict behavior: availability reductions conflicting with current/future assigned shifts and leave approvals overlapping assigned shifts return `SCHEDULE_CONFLICT` without partial mutation.
- Phase 9 source verification: `demo:verify` creates isolated synthetic Manager/candidates/shift data, requires an eligible operator plus a role-blocked candidate, applies the approved proposal, checks all four audit actions, measures one fewer unfilled shift, and deletes its fixture records.
- Phase 9 PostgreSQL execution: PASS on 2026-10-16; one eligible and one role-blocked candidate were observed, unfilled shifts changed from 1 to 0, the proposal reached `APPLIED`, all four expected audit actions were present, and the synthetic fixture was removed.
- Phase 9 milestone regression: PASS with PostgreSQL enabled for 95/95 backend tests across 25 files with zero skips, 17/17 frontend tests, readiness 5/5, lint, typecheck, production build, and `git diff --check`.

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

See `docs/OPEN_ISSUES_HANDOFF.md` for the issue-by-issue handoff, evidence requirements, and remaining owner decisions.

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- Public pages conflict: overview says online build ends 18 October, while the live page says 17 October. Exact cutoff time/timezone remains unverified.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- AMD Token Factory adapter status: IMPLEMENTED BUT NOT TESTED against the live service; mocked responses are not compliance evidence.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- GitHub detects no license for this repository or its ShiftFlow source; ownership and MIT-compatibility must be resolved before submission.
- Six full-tree dependency advisories remain; resolving them requires compatibility testing of Vitest/Prisma version changes. No forced fix was used.
- Proposal apply, availability replacement, approved leave, and ordinary shift writes share the employee-lock/Serializable protocol. PostgreSQL verifies the core cross-route matrix. Production load, lock-wait telemetry, and forced retry-exhaustion behavior remain unverified.

## Phase gate

Complete and stop after the local Phase 9 checkpoint. Do not push, merge, deploy, submit, or begin another phase without explicit approval.
