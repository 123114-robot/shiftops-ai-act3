# Project Status

Last updated: 2026-10-16 (Australia/Sydney)

## UI/UX redesign (local feature branch)

- Branch: `feature/shiftops-ui-ux-redesign`, based on verified integration commit `5360ce5`.
- Implemented: persistent system-default light/dark theme, semantic design tokens, role-aware sidebar/header, shared layout and feedback components.
- Employee management: responsive list/detail layouts, explicit edit states, confirmed deactivation and record-preserving reactivation through the existing Manager-only PATCH contract.
- Weekly roster: Manager Day/Week/Month/Custom ranges, range validation, presets and period navigation using the existing shift range API; employee weekly API remains unchanged.
- Shift management: visibly separate create/edit modes and confirmed saved-shift cancellation.
- Dashboard, availability, leave and ShiftOps Copilot use the shared shell without changing business logic, API contracts or AMD provider behavior.
- Automated validation and manual UAT status are recorded below and in `docs/UI_UX_UAT_CHECKLIST.md`. Owner UAT is not yet claimed.
- UI/UX feature validation: PASS for lint, typecheck, production build, readiness 5/5, PostgreSQL-enabled backend 95/95, frontend 23/23 and `git diff --check`.
- `npm run db:generate`: BLOCKED by a Windows file lock from the already-running local backend; the existing generated client remained usable for all 95 PostgreSQL-enabled backend tests and the production build.
- Limited authenticated browser check: PASS for Manager login, Dashboard, theme toggle/persistence across navigation, narrow employee cards and Weekly Roster controls/empty state. Wide-screen browser review, mutation workflows and owner UAT remain pending. See `docs/UI_UX_BROWSER_EVIDENCE.md`.

## Current state

- Phase: 10 complete within its local evidence boundary; final repository documentation cleanup in progress
- Source: local ShiftFlow checkout, branch `codex/phase-9-basic-dashboard`, commit `6ea907b`
- Original checkout: clean and unchanged during this work
- New repository: isolated, public GitHub repository; local cleanup branch `docs/act3-final-repository-cleanup` created from verified integration commit `e6bae759`
- Implemented: Phases 0–5 plus CI coverage, strict business-time handling, transaction-scoped proposal revalidation, constrained explanations, typed error mapping, reject UI, provenance and audit hardening
- Implemented in Phase 7: official Token Factory endpoint contract, explicit provider/source labels, response-model provenance validation, sanitized inference trace, and reproducible synthetic evidence command
- Implemented and merged in Phase 8: ordinary shift create/update/reassignment/unassignment/cancel now validate and persist inside the shared employee-lock and Serializable transaction boundary
- Remediated after the Phase 8 independent audit: leave review now performs an atomic pending-state transition and maps exhausted serialization conflicts without weakening Manager authorization or schedule-conflict checks
- Implemented and merged in Phase 9: a self-cleaning synthetic PostgreSQL evidence command that verifies the full incident-to-audit workflow and measures the backend-derived unfilled-shift delta without claiming AMD execution
- Verified and merged in Phase 10: the rendered Manager UI completes login, shift creation, candidate evaluation, proposal creation, explicit approval, apply, and audit display against the real local API and PostgreSQL database
- Latest verified remote integration: default branch `feature/phase-0-foundation`, commit `e6bae759476ce9340f27957c20eff1f4937befab`; GitHub Actions run `38827402353` completed successfully with PostgreSQL
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
- Phase 10 browser verification: PASS on 2026-10-16; one eligible and two blocked candidates were displayed, the proposal reached `APPLIED`, all four expected audit actions were visible, and the explanation was explicitly labelled deterministic.
- Phase 10 database cross-check and cleanup: PASS; the shift/proposal/incident reached `SCHEDULED`/`APPLIED`/`RESOLVED`, then exactly four audit events, one proposal, one incident, and one temporary shift were removed, leaving zero rows for the fixture shift.
- Phase 10 milestone regression: PASS with PostgreSQL enabled for 95/95 backend tests across 25 files with zero skips, 17/17 frontend tests, readiness 5/5, lint, typecheck, production build, and `git diff --check`.
- Latest merged integration CI: PASS on 2026-10-16 at commit `e6bae759`; run `https://github.com/123114-robot/shiftops-ai-act3/actions/runs/38827402353` completed successfully with the PostgreSQL service enabled.
- Final repository cleanup validation: PASS for readiness 5/5, lint, typecheck, backend 95/95 with PostgreSQL and zero skips, frontend 17/17, production build, and `git diff --check`. The readiness command correctly remains `BLOCKED` for missing live AMD evidence and submission assets.

Database-backed tests require PostgreSQL and are not evidence of AMD/Evolus access.

## Known blockers and unknowns

See `docs/OPEN_ISSUES_HANDOFF.md` for the issue-by-issue handoff, evidence requirements, and remaining owner decisions.

- User registration, ADP approval, team enrollment, and event workspace access cannot be verified from public pages.
- Submission deadline: **18 October 2026, 9:00 PM AEDT**, sourced from the user's authenticated lablab.ai event page screenshot. Codex did not independently inspect that authenticated screenshot; enrollment and portal state remain unverified.
- AMD Developer Cloud allocation, credentials, model endpoint, and inference evidence are unavailable locally.
- AMD Token Factory adapter status: IMPLEMENTED BUT NOT TESTED against the live service; mocked responses are not compliance evidence.
- Evolus event code/workspace, API key, and connected AMD vLLM endpoint are unavailable locally.
- Track selection remains open; Evolus is optional for the main event but mandatory for its partner prize.
- GitHub detects no license for this repository or its ShiftFlow source; ownership and MIT-compatibility must be resolved before submission.
- Six full-tree dependency advisories remain; resolving them requires compatibility testing of Vitest/Prisma version changes. No forced fix was used.
- Proposal apply, availability replacement, approved leave, and ordinary shift writes share the employee-lock/Serializable protocol. PostgreSQL verifies the core cross-route matrix. Production load, lock-wait telemetry, and forced retry-exhaustion behavior remain unverified.

## Phase gate

Complete and stop after the bounded repository documentation cleanup. Do not push, create a PR, rename the default branch, merge, deploy, submit, or begin product development without explicit approval.
