# Architecture

## Baseline audit

The preserved ShiftFlow application is an npm workspace: React/TypeScript/Vite frontend, Express/TypeScript backend, Prisma/PostgreSQL persistence, JWT authentication, MANAGER/EMPLOYEE middleware, and Vitest/Supertest/Testing Library tests. Backend flow is routes -> services -> repositories/Prisma. Scheduling rules already cover active employees, recurring availability, overlap, approved leave, time ordering, cancellation, and adjacent shifts.

## Phase 0 shape

```text
React frontend (preserved)
        |
Express API (preserved auth/RBAC)
        |-- /api/health
        `-- /api/shiftops/health  [Phase 0 only]
        |
Services -> repositories -> Prisma -> PostgreSQL (preserved)
```

The new health route is deliberately database-independent so installation and CI can verify the ShiftOps foundation without fabricating downstream readiness.

## Planned boundaries (not implemented)

Later phases may add a `shiftops` backend module containing a ShiftFlow data adapter, deterministic eligibility/ranking, proposal state machine, approval/application service, audit persistence, and server-side explanation provider. Existing employee and shift tables remain authoritative. A modular monolith is preferred; no microservices or new orchestration framework are justified for the MVP.

## Compatibility and migration

Phase 0 adds no schema migration, changes no existing endpoint, and introduces no runtime dependency. The only new API contract is `GET /api/shiftops/health` returning `{ status, service, phase }`.
