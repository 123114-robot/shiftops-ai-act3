# Architecture Decision Record

## ADR-001 — Isolated source snapshot

- Status: Accepted, 2026-10-10
- Decision: Create a new Git repository from the tracked ShiftFlow commit `6ea907b`, without copying its Git history or configuring a remote.
- Rationale: Protects the portfolio repository, preserves attribution/provenance, and keeps hackathon work independently reviewable.
- Consequence: Future upstream synchronization must be explicit and reviewed.

## ADR-002 — Preserve the modular monolith

- Status: Accepted
- Decision: Retain React + Express + Prisma/PostgreSQL and existing route/service/repository boundaries.
- Rationale: The current stack already supports authentication, RBAC, scheduling, tests, and CI. A new framework or database would add risk without Phase 0 value.

## ADR-003 — Database-independent health contract

- Status: Accepted
- Decision: Add only `GET /api/shiftops/health` in Phase 0.
- Rationale: It proves routing, compilation, and test harness readiness while making no claim that business or provider integrations exist.

## ADR-004 — Provider configuration without integration

- Status: Accepted
- Decision: Reserve server-side `AI_*` environment names with deterministic mode as the default; implement no provider client yet.
- Rationale: Prevents secret leakage and avoids pretending AMD or Evolus access is available.

## Open decisions

- Competition track selection and Evolus participation.
- Exact AMD Developer Cloud/vLLM model and evidence method.
- Minimal persistence additions for incident/proposal/audit, after Phase 1 design inspection.

## ADR-005 — Read-only deterministic eligibility boundary

- Status: Accepted, 2026-10-11
- Decision: Add a pure eligibility service behind a read-only repository contract, with a Prisma adapter over existing ShiftFlow records and no API or schema change.
- Rationale: Keeps business-rule evaluation testable and prevents Phase 1 from acquiring mutation or authorization responsibilities.
- Ranking: eligible candidates receive their remaining configured weekly minutes after the proposed shift; ties use `employeeId` ascending.
- Consequence: role matching is exact and opt-in, and the caller must provide the configurable weekly-minute ceiling. Legal compliance is not implied.

## ADR-006 — Transactional human approval workflow

- Status: Accepted, 2026-10-12
- Decision: Persist incidents, proposals, and audit events; require authenticated Manager routes; revalidate eligibility at apply time; apply the schedule mutation and audit transactionally.
- Concurrency: proposal status/version guards prevent repeated transitions, while the captured shift `updatedAt` rejects stale proposals.
- Rationale: the LLM is not authoritative and cannot approve or mutate schedules. Every mutation is attributable to a Manager.
- Migration note: the repository has no historical Prisma migration baseline, so Phase 2 retains its established `prisma db push` development/CI strategy. A deployable migration baseline is required before production release.

## ADR-007 — Grounded OpenAI-compatible explanation adapter

- Status: Accepted, 2026-10-12
- Decision: Keep deterministic explanations as the default; optionally use a server-side OpenAI-compatible endpoint and validate structured output against the selected employee ID and the exact validated reason-code set.
- Failure behavior: timeout, HTTP error, malformed JSON, mismatched ID, empty text, or text over 800 characters returns the deterministic explanation.
- Rationale: enables a real AMD-hosted vLLM path without giving the model authority over eligibility or mutation and without adding an SDK dependency.
- Evidence boundary: adapter and mocked protocol tests do not prove AMD execution. Real endpoint, model, hardware, and latency remain unverified.
