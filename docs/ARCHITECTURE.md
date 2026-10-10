# Architecture

## Baseline audit

The preserved ShiftFlow application is an npm workspace: React/TypeScript/Vite frontend, Express/TypeScript backend, Prisma/PostgreSQL persistence, JWT authentication, MANAGER/EMPLOYEE middleware, and Vitest/Supertest/Testing Library tests. Backend flow is routes -> services -> repositories/Prisma. Scheduling rules already cover active employees, recurring availability, overlap, approved leave, time ordering, cancellation, and adjacent shifts.

## Current shape

```text
React frontend (preserved)
        |
Express API (preserved auth/RBAC)
        |-- /api/health
        `-- /api/shiftops/health  [Phase 0 only]
        |
ShiftOpsEligibilityService
        |
ShiftOpsRepository (read-only contract)
        |
PrismaShiftOpsRepository
        |
Services -> repositories -> Prisma -> PostgreSQL (preserved)
```

The health route remains database-independent. Phase 1 adds no API surface: callers must explicitly supply the eligibility policy, and the adapter only reads existing ShiftFlow employee, availability, leave, and shift records.

## Phase 1 eligibility and ranking

The service excludes inactive employees, incomplete availability, approved leave, overlapping assignments, configured role mismatches, and candidates who would exceed the configured weekly-minute limit. Eligible score equals `maxWeeklyMinutes - existingWeeklyMinutes - proposedShiftMinutes`; higher scores rank first and `employeeId` breaks ties. The score is an operational workload-balancing value, not an employment-performance assessment.

Later phases may add a proposal state machine, approval/application service, audit persistence, API, and server-side explanation provider. Existing employee and shift tables remain authoritative. A modular monolith remains preferred.

## Compatibility and migration

Phase 1 adds no schema migration, changes no existing endpoint, writes no data, and introduces no runtime dependency. It preserves current ShiftFlow call sites and business behavior.
