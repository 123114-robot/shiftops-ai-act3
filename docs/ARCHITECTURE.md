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

Existing employee and shift tables remain authoritative. A modular monolith remains preferred; later phases may add only the UI needed around these backend boundaries.

## Phase 2 proposal workflow

All `/api/shiftops` workflow routes require authenticated `MANAGER` role. `ShiftOpsProposalService` permits these transitions:

```text
OPEN incident -> PENDING_APPROVAL proposal
PENDING_APPROVAL -> APPROVED -> APPLIED
PENDING_APPROVAL -> REJECTED
```

Proposal creation accepts only a currently eligible candidate. Apply re-runs deterministic eligibility. The repository uses proposal `version` plus expected status for review/apply concurrency, and compares the shift's captured `updatedAt` value before mutation. The shift assignment, proposal transition, incident resolution, and audit event occur in one Prisma transaction. Rejected, stale, already-applied, or concurrently modified proposals fail without a schedule mutation.

New persistence is limited to `ShiftIncident`, `ShiftProposal`, and `ShiftOpsAuditEvent`. This repository currently uses `prisma db push`; a production migration baseline remains future release work.

## Compatibility and migration

Phase 2 adds isolated tables and `/api/shiftops` endpoints, but changes no existing endpoint and introduces no runtime dependency. Existing ShiftFlow call sites remain compatible.

## Phase 3 grounded explanations

`ShiftOpsProposalService` rejects ineligible candidates before requesting an explanation. The explanation provider receives only the selected employee ID, shift ID, deterministic score, and validated reasons. Deterministic mode formats those facts locally.

Remote mode uses the standard OpenAI-compatible `POST /chat/completions` contract through Node's built-in `fetch`. It requests structured JSON with `employeeId`, `reasonCodes`, and `explanation`, applies a timeout, checks the returned ID and requires the reason-code set to exactly match the validated input, limits output length, and falls back deterministically on any provider or validation failure. Provider output is stored as explanation text only; it cannot modify eligibility, approval state, or database mutations.
