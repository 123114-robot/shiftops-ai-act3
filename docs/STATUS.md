# Project Status

Last updated: 2026-10-13 (Australia/Sydney)

## Current state

- Phase: 6 audit hardening
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, public GitHub repository; working branch `fix/phase-6-audit-hardening`
- Implemented: Phases 0–5 plus CI coverage, strict business-time handling, transaction-scoped proposal revalidation, constrained explanations, typed error mapping, reject UI, provenance and audit hardening
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
- Phase 6 local unit/route tests: PASS, 78 backend tests and 17 frontend tests.
- Phase 6 readiness tests: PASS, 4 tests.
- Phase 6 PostgreSQL integration/concurrency: BLOCKED locally; 3 tests skipped because the Docker Desktop Linux engine pipe was unavailable. GitHub CI is configured with PostgreSQL and `DATABASE_TESTS=true`; no CI conclusion is claimed before the remote run completes.
- Phase 6 lint, typecheck, production build, Prisma schema validation, and `git diff --check`: PASS.
- npm audit after safe non-forced fixes: full tree 6 findings (1 moderate, 3 high, 2 critical); production-only 3 high findings. See `docs/NPM_AUDIT.md`.

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- Public pages conflict: overview says online build ends 18 October, while the live page says 17 October. Exact cutoff time/timezone remains unverified.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- AMD adapter status: NOT TESTED against real AMD infrastructure; mocked OpenAI-compatible tests are not compliance evidence.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- GitHub detects no license for this repository or its ShiftFlow source; ownership and MIT-compatibility must be resolved before submission.
- Six full-tree dependency advisories remain; resolving them requires compatibility testing of Vitest/Prisma version changes. No forced fix was used.
- Proposal apply now locks by employee and revalidates inside a Serializable transaction. Availability replacement and approved leave share that lock. Ordinary shift create/update still validates before repository persistence, so full cross-route scheduling serialization remains PARTIAL.

## Phase gate

Stop after Phase 6. Do not merge its PR, deploy, submit, or begin Phase 7 without explicit approval.
