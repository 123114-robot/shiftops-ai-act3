# Project Status

Last updated: 2026-10-14 (Australia/Sydney)

## Current state

- Phase: 7 AMD Token Factory integration
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, public GitHub repository; working branch `feature/phase-7-amd-token-factory`
- Implemented: Phases 0–5 plus CI coverage, strict business-time handling, transaction-scoped proposal revalidation, constrained explanations, typed error mapping, reject UI, provenance and audit hardening
- Implemented in Phase 7: official Token Factory endpoint contract, explicit provider/source labels, response-model provenance validation, sanitized inference trace, and reproducible synthetic evidence command
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

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- Public pages conflict: overview says online build ends 18 October, while the live page says 17 October. Exact cutoff time/timezone remains unverified.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- AMD Token Factory adapter status: IMPLEMENTED BUT NOT TESTED against the live service; mocked responses are not compliance evidence.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- GitHub detects no license for this repository or its ShiftFlow source; ownership and MIT-compatibility must be resolved before submission.
- Six full-tree dependency advisories remain; resolving them requires compatibility testing of Vitest/Prisma version changes. No forced fix was used.
- Proposal apply now locks by employee and revalidates inside a Serializable transaction. Availability replacement and approved leave share that lock. Ordinary shift create/update still validates before repository persistence, so full cross-route scheduling serialization remains PARTIAL.

## Phase gate

Stop after the Phase 7 PR. Do not merge, deploy, submit, or begin another phase without explicit approval.
