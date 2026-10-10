# ShiftFlow Project Tasks

## Phase 0 — Planning

- [x] Business problem, stakeholders, scope, requirements, and rules
- [x] User stories and use cases
- [x] Architecture, database, API, security, testing, roadmap
- [x] Separate V1 from V2

## Phase 1 — Scaffold

- [x] npm frontend/backend workspace
- [x] React, TypeScript, Vite, Tailwind
- [x] Express and TypeScript
- [x] Prisma and PostgreSQL
- [x] Five core data models and seed
- [x] GET /api/health and frontend connection screen
- [x] Vitest, Testing Library, Supertest, database integration test
- [x] Record final install/build/lint/test/database results

### Phase 1 verification (2026-09-26)

- npm install: passed (433 packages installed; npm reported 5 dependency advisories)
- Prisma client generation and schema validation: passed
- Backend tests: 1 passed; live database test skipped because Docker Desktop engine did not become ready
- Frontend tests: 1 passed
- TypeScript/backend and Vite/frontend production builds: passed
- Backend and frontend ESLint: passed
- PostgreSQL container, db push, seed, and live SELECT 1: not verified; Docker engine unavailable

## Phase 2 — Authentication and roles

- [x] Password hashing and real development credentials
- [x] Login and current-user endpoints
- [x] JWT authentication middleware
- [x] Manager/employee authorization middleware
- [x] Protected frontend routes
- [x] Authentication and RBAC tests

### Phase 2 verification (2026-09-27)

- Authentication and route tests: 6 passed
- Health regression test: 1 passed
- Frontend authentication tests: 2 passed
- Full TypeScript/Vite production build: passed
- Backend and frontend ESLint: passed without warnings
- Prisma schema validation: passed
- Live PostgreSQL test and seed execution: not verified; Docker Desktop engine was unavailable

## Phase 3 — Employee management

- [x] Manager employee list, create, detail, and update API
- [x] Soft deactivation through DELETE without physical deletion
- [x] Manager-only API enforcement and employee-user 403 response
- [x] Employee service, repository, validation, and consistent errors
- [x] Manager employee directory with create and deactivate actions
- [x] Service, route, permission, and UI tests

### Phase 3 verification (2026-09-27)

- Backend tests: 14 passed; live database test skipped
- Frontend tests: 3 passed
- Backend and frontend production build: passed
- Backend and frontend ESLint: passed
- Live PostgreSQL referential-integrity execution: not verified because Docker was unavailable

## Phase 3.5 — Authentication Hardening & Employee UI Completion

- [x] Employee detail route and manager navigation
- [x] Employee edit form using the existing PATCH endpoint
- [x] Clear update success and API error states
- [x] Inactive employees remain visible and viewable
- [x] Restore sessions by validating the stored JWT through /api/auth/me
- [x] Clear invalid/expired tokens and return to login
- [x] Loading state prevents protected-content flashes
- [x] Login redirects directly according to the server-provided role
- [x] Authentication restoration, detail, update, and access-control tests

### Phase 3.5 verification (2026-09-27)

- Backend tests: 14 passed; live database test skipped
- Frontend tests: 6 passed
- Backend and frontend production build: passed
- Backend and frontend ESLint: passed

## Phase 4 — Availability

- [x] Employee reads and replaces their own seven-day recurring availability
- [x] Available days require valid HH:mm start/end ranges
- [x] Unavailable days store no times
- [x] Manager reads an employee's availability without edit access
- [x] Employee ownership and manager access control
- [x] Employee editor and manager read-only UI
- [x] Service, route, validation, ownership, and UI tests

### Phase 4 verification (2026-09-29)

- Availability backend targeted tests: 6 passed
- Full backend regression: 20 passed; live database test skipped
- Full frontend regression: 9 passed
- Backend and frontend typecheck: passed
- Backend and frontend ESLint: passed without warnings
- Backend and frontend production build: passed
- Live PostgreSQL persistence: covered by Prisma repository code; local database execution not verified

## Phase 5 — Shift CRUD

- [x] Manager creates shifts with date, time, role, notes, status, and optional employee
- [x] Manager edits existing shifts
- [x] Manager cancels shifts without physical deletion
- [x] Manager lists shifts by inclusive date range
- [x] Manager-only API and protected UI route
- [x] Service, route, validation, RBAC, and UI tests

### Phase 5 verification (2026-09-29)

- Shift backend targeted tests: 8 passed
- Frontend tests including Shift CRUD: 10 passed
- Full backend regression: 28 passed; live database test skipped
- Full frontend regression: 10 passed
- Backend and frontend typecheck: passed
- Backend and frontend ESLint: passed without warnings
- Backend and frontend production build: passed
- Phase 6 scheduling validation is intentionally deferred

## Phase 6 — Scheduling validation

- [x] Shift end time must be later than start time
- [x] Assigned shifts cannot overlap; adjacent shifts remain allowed
- [x] Assigned shifts must fit recurring availability
- [x] Approved leave blocks assignment for covered dates
- [x] Inactive employees cannot receive new or updated assignments
- [x] Scheduling rules live once in SchedulingService
- [x] Stable business-rule error codes flow through the Shift API

### Phase 6 verification (2026-09-30)

- Scheduling and related Shift targeted tests: 15 passed
- Full backend regression: 35 passed; live database test skipped
- Full frontend regression: 10 passed
- Backend and frontend typecheck: passed
- Backend and frontend ESLint: passed without warnings
- Backend and frontend production build: passed
- Live PostgreSQL query execution: not verified locally

## Phase 7 — Leave requests

- [x] Employee submits leave using their authenticated employee identity
- [x] Employee views only their own leave requests and statuses
- [x] Manager lists all leave requests
- [x] Manager approves or rejects pending requests
- [x] Invalid date ranges and repeated reviews are rejected
- [x] Role permissions and ownership are enforced
- [x] Approved leave remains integrated with scheduling validation
- [x] Employee and manager Leave UI workflows

### Phase 7 verification (2026-10-04)

- Leave and scheduling targeted backend tests: 14 passed
- Leave UI targeted tests: 2 passed
- Full backend regression: 43 passed; live database test skipped
- Full frontend regression: 12 passed
- Backend and frontend typecheck: passed
- Backend and frontend ESLint: passed without warnings
- Backend and frontend production build: passed
- Live PostgreSQL persistence: not verified locally

Later: weekly roster, then optional dashboard. V2 is out of scope.

## Phase 8 — Weekly roster

- [x] Manager views all non-cancelled shifts for a seven-day range
- [x] Employee views only their own non-cancelled weekly shifts
- [x] Server-derived employee scope and role permissions
- [x] Manager and employee weekly roster UI
- [x] Empty-week state and selectable week start

### Phase 8 verification (2026-10-04)

- Backend roster route tests added
- Full backend regression: 46 passed; live database test skipped
- Full frontend regression: 14 passed
- Backend and frontend typecheck: passed
- Backend and frontend ESLint: passed without warnings
- Backend and frontend production build: passed

## Phase 9 — Basic dashboard

- [x] Manager-only dashboard summary API
- [x] Employees working today metric
- [x] Unfilled shifts this week metric
- [x] Employees on approved leave today metric
- [x] Total scheduled hours this week metric
- [x] Manager dashboard metric cards and loading/error states
- [x] Service, route, RBAC, and UI tests

### Phase 9 verification (2026-10-04)

- Dashboard targeted backend tests: 3 passed
- Dashboard targeted frontend tests: 1 passed
- Backend and frontend typecheck: passed
- Backend and frontend ESLint: passed without warnings
- Full backend regression: 49 passed; live database test skipped
- Full frontend regression: 15 passed
- Backend and frontend production build: passed

Phase 10 and V2 are out of scope and have not been started.
