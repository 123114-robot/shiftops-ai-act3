# Phase 8 Leave Review Atomicity Remediation

Date: 2026-10-16 (Australia/Sydney)

## Scope and baseline

- Finding: Kimi F-1, concurrent review of one pending leave request could be last-writer-wins.
- Audited reference commit: `96326239d3e60c4beb9b51af4a195e747fcea87e`.
- Remediation branch: `fix/phase-8-leave-review-atomicity`.
- Branch start and merge-base with the reference: `96326239d3e60c4beb9b51af4a195e747fcea87e`.
- Phase 9 changes are not present.
- No schema migration, dependency change, UI change, authentication change, deployment, push, or PR is included.

## Independent RED reproduction — VERIFIED

An original PostgreSQL regression uses a synchronization barrier around `LeaveRepository.findById`. Both Service calls must read the same `PENDING` state before either repository review is allowed to continue. This removes dependence on incidental `Promise.allSettled` timing while retaining the real Prisma repository and database transactions.

Command:

```powershell
$env:DATABASE_URL='postgresql://shiftflow:shiftflow_dev@localhost:5432/shiftflow?schema=public'
$env:DATABASE_TESTS='true'
npm run test -w backend -- --run tests/leave-review.database.test.ts
```

Result before the product fix:

- PostgreSQL test executed, rather than skipped.
- `APPROVED` versus `REJECTED` returned two fulfilled operations.
- Assertion failed at the expected invariant: expected one fulfilled operation, received two.
- This independently confirmed F-1 against commit `9632623`.

## Root cause — VERIFIED

`LeaveService.review` checked `PENDING` before entering the repository transaction. `PrismaLeaveRepository.review` then used an unconditional update by leave ID. After a Serializable retry, the losing transaction could update a request already reviewed by the winner.

Serializable isolation and the employee schedule advisory lock protect transaction ordering, but they do not replace a conditional state-transition predicate.

## Minimal fix

`PrismaLeaveRepository.review` now:

1. Reads authoritative leave state inside the Serializable transaction.
2. Rejects a non-`PENDING` state with `LEAVE_ALREADY_REVIEWED`.
3. Preserves the employee advisory lock and assigned-shift conflict query for approval.
4. Uses `updateMany` with `{ id, status: 'PENDING' }`.
5. Requires exactly one affected row.
6. Returns the persisted row after the update.
7. Maps an exhausted Prisma `P2034` retry sequence to `CONCURRENT_REVIEW`.

The leave route maps `LEAVE_ALREADY_REVIEWED`, `SCHEDULE_CONFLICT`, and `CONCURRENT_REVIEW` to HTTP 409.

## Independent GREEN verification — VERIFIED

The PostgreSQL regression now covers:

- concurrent `APPROVED` versus `REJECTED`;
- concurrent `APPROVED` versus `APPROVED`;
- concurrent `REJECTED` versus `REJECTED`;
- final status, `reviewedById`, and `reviewedAt` matching the winner;
- repeated review rejection with `LEAVE_ALREADY_REVIEWED`;
- approval versus overlapping shift reassignment;
- existing approval versus shift creation coverage in the Phase 8 database suite;
- stable HTTP 409 mappings;
- exhausted `P2034` classification;
- existing Manager RBAC and employee ownership tests.

The four-test leave concurrency file passed five consecutive executions. A combined targeted run passed 19/19 tests across leave unit/routes, the new database regressions, and the existing cross-route database suite.

## PostgreSQL environment — VERIFIED

- Runtime: Docker Desktop local Linux engine.
- Image: `postgres:17-alpine`.
- PostgreSQL server: `17.11`.
- Container health during final verification: healthy.
- Schema: synchronized with `prisma db push` against the disposable local development database.
- Fixtures: synthetic users, Managers, employees, leave requests, availability, and shifts only.

## Full verification

Commands executed:

```powershell
npm ci
npm run db:generate
$env:DATABASE_TESTS='true'
npm test
npm run lint
npm run typecheck
npm run test:readiness
npm run build
git diff --check
npm audit
npm audit --omit=dev
```

Results:

- Backend with PostgreSQL: **95/95 PASS**, zero skipped.
- Frontend: **17/17 PASS**.
- Submission-readiness tests: **5/5 PASS**.
- Lint: **PASS**.
- Typecheck: **PASS**.
- Production build: **PASS**.
- `git diff --check`: **PASS**.
- CI: **NOT RUN** because this branch was not pushed and no PR was created.

## Other Kimi findings

### R-1 — AMD runtime

**BLOCKED / UNVERIFIED.** No AMD evidence file was found. The readiness check remains blocked without remote AMD configuration, credentials, an exact model ID, and successful live inference evidence. Mocked provider tests are not AMD runtime proof.

### R-2 — Dependencies

**VERIFIED CURRENT AUDIT COUNTS; remediation remains open.**

- Full dependency tree: 6 findings — 1 moderate, 3 high, 2 critical.
- Production-only tree: 3 high findings.
- No forced dependency upgrade was performed in this branch.

### R-3 — Browser and deployment

**BLOCKED / UNVERIFIED.** Source tests and the frontend component suite do not prove browser E2E, a publicly deployed application, external database behavior, or production observability. This remediation intentionally does not expand into deployment work.

### R-4 — Earlier independent harness failures

**NOT APPLICABLE as product defects.** No product issue is claimed from Kimi's earlier ignored stub payload, incorrect prompt assertion, or direct Prisma incident setup. F-1 was reproduced independently with a new controlled PostgreSQL test.

## Competition readiness

**BLOCKED.** With public-repository visibility supplied to the local checker, the repository gate is `VERIFIED` and local mode is `READY`, but AMD evidence remains `BLOCKED` and the working prototype URL, demo video, and pitch deck remain `MISSING`. This atomicity fix does not change those external gates.

## Modified files

- `backend/src/repositories/LeaveRepository.ts`
- `backend/src/services/LeaveService.ts`
- `backend/src/routes/leave.ts`
- `backend/tests/leave-review.database.test.ts`
- `backend/tests/leave.repository.test.ts`
- `backend/tests/leave.routes.test.ts`
- `docs/PHASE_8_LEAVE_REVIEW_ATOMICITY_REMEDIATION.md`

## Rollback

Revert the single remediation commit after it is created. No database rollback is required because the Prisma schema is unchanged. Reverting would intentionally restore the confirmed F-1 race, so rollback should be followed by an explicit risk decision.
