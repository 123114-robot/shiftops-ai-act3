# ShiftOps AI Agent Rules

- Purpose: extend ShiftFlow into a human-approved scheduling copilot, one authorized phase at a time.
- Preserve the original ShiftFlow checkout and this repository's existing application logic; never develop on or push to `main` without explicit approval.
- Workflow: `coding-workflow` -> architecture review when boundaries change -> TDD for behavior -> diagnose failures -> final code review.
- Setup: `npm ci`; `npm run db:generate`; copy both `.env.example` files before local database use.
- Run: `npm run dev`. Test: targeted Vitest first, then `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` at milestones.
- Keep eligibility, authorization, state transitions, and authoritative schedule mutations on the backend. Preserve existing authentication and MANAGER/EMPLOYEE RBAC.
- LLM output may explain validated facts but must never invent eligibility facts, approve proposals, or mutate the database directly.
- Use synthetic fixtures only; commit no secrets or real employee PII. Treat legal and working-hour limits as configurable.
- Keep changes small and reversible. Do not add paid APIs, deployment, OR-Tools, LangGraph, Evolus, or business features before their phase is approved.
- Definition of Done: scoped behavior tested, regression checks pass, docs/status updated, actual limitations reported, and competition claims independently verified.
- Competition gate: AMD and any partner-track requirement must be demonstrated with real evidence before it is marked compliant.
