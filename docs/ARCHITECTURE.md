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

Remote mode uses the standard OpenAI-compatible `POST /chat/completions` contract through Node's built-in `fetch`. It requests structured JSON with `employeeId`, `reasonCodes`, and a constrained rendering `style`, applies a timeout, checks the returned ID and model, requires the reason-code set to exactly match the validated input, limits output length, and falls back deterministically on any provider or validation failure. Provider output selects only the local rendering style; it cannot add explanation claims, modify eligibility, approve a proposal, or mutate the database.

## Phase 7 AMD Token Factory adapter

`AI_PROVIDER=amd-token-factory` reuses the Phase 3 pathway with AMD Radeon Cloud Token Factory's official shared OpenAI-compatible URL. The adapter omits the undocumented `response_format` option, requires the returned model to equal the configured model, captures only sanitized provenance, and visibly labels AMD, deterministic fallback, deterministic, and mocked-test outcomes. The live verification command uses synthetic facts and creates a non-secret evidence record only after strict grounding succeeds. This architecture does not itself prove a real AMD request; runtime evidence remains a separate gate.

## Phase 8 authoritative scheduling writes

Ordinary shift create, update/reassignment, unassignment, and cancellation now use the same employee-scoped advisory-lock and Serializable retry protocol as proposal apply, availability replacement, and approved-leave review. `PrismaShiftRepository` performs scheduling validation through a transaction-scoped `PrismaSchedulingRepository` immediately before persistence. Reassignments lock the old and new employee IDs in deterministic lexical order. The API contract is unchanged, and retry exhaustion produces a stable scheduling conflict rather than a partial write.

PostgreSQL race tests verify that ordinary creation or reassignment racing proposal apply cannot both assign the same employee to overlapping shifts. Availability replacement now rejects a reduction that conflicts with a current/future assigned shift, and leave approval rejects a date range containing an assigned shift; both checks occur after the shared employee lock and before persistence. The six-case database race matrix passed five consecutive runs locally, followed by a complete 88/88 backend run with database tests enabled. Production load, lock-wait telemetry, and retry-exhaustion behavior remain separate verification work.

## Phase 4 Manager UI

The protected `/shiftops` route is a thin workflow client over the existing `/api/shiftops` boundary. It creates an incident, asks the backend to evaluate that open incident, renders eligible and blocked candidates with deterministic reasons, and then drives proposal creation, approval, apply, and audit retrieval. The evaluation endpoint exposes the Phase 1 evaluator only after resolving an open persisted incident; it does not accept client-supplied eligibility facts. No schema or dependency changes were introduced.
