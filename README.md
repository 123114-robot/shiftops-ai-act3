# ShiftOps AI

ShiftOps AI is a human-approved workforce scheduling copilot built on the existing ShiftFlow application. It helps managers resolve staffing gaps without moving eligibility, approval, or schedule authority out of the backend.

## Product overview

Shift-based small and medium businesses often coordinate rosters, availability, leave, and last-minute absences across spreadsheets and chat. ShiftOps AI gives managers one auditable workflow to identify a staffing incident, compare validated candidates, approve a proposal, apply the assignment atomically, and review the resulting audit trail.

Target users are workforce managers who resolve staffing gaps and employees whose availability, leave, roles, and assigned hours must remain authoritative.

## Core features

- Deterministic candidate eligibility using active status, availability, approved leave, overlap, role, and configurable weekly-minute limits.
- Stable candidate ranking with explicit eligible and blocked reasons.
- Manager-only incident and proposal workflow with explicit approve or reject actions.
- Apply-time eligibility revalidation and atomic schedule, incident, proposal, and audit updates.
- PostgreSQL serialization and shared employee locking across proposal apply, ordinary shift writes, availability changes, and leave approval.
- Protected Manager UI covering incident creation through final audit display.
- Grounded explanations that can use deterministic output or a strictly validated remote provider without giving an LLM mutation authority.
- Self-cleaning synthetic PostgreSQL demo and evidence commands.

## Architecture and technology

The repository is an npm workspace with:

- React, TypeScript, and Vite in `frontend/`.
- Express, TypeScript, Prisma, and PostgreSQL in `backend/`.
- JWT authentication with preserved MANAGER and EMPLOYEE RBAC.
- Vitest, Supertest, Testing Library, and PostgreSQL integration tests.
- GitHub Actions CI with a PostgreSQL service.

The backend remains authoritative for eligibility, authorization, state transitions, and schedule mutations. Remote AI may explain only facts that the deterministic workflow has already validated.

## AMD Token Factory status

The AMD Token Factory adapter is implemented against the documented shared endpoint contract. It validates response shape, candidate identity, exact reason codes, returned model identity, output size, timeout, and provenance before accepting an explanation. Invalid or unavailable remote output falls back deterministically.

**Live AMD inference remains UNVERIFIED.** No successful real Token Factory request, model allocation, account runtime, or AMD hardware evidence has been recorded. Mocked adapter tests and green CI are not live AMD evidence. See [docs/AMD_TOKEN_FACTORY.md](docs/AMD_TOKEN_FACTORY.md).

## Setup

Prerequisites: Node.js 20.19 or newer (CI uses Node 22), npm, and PostgreSQL. Docker Desktop can provide the local database.

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
npm ci
npm run db:generate
docker compose up -d postgres
npm run db:push
npm run db:seed
npm run dev
```

Development seed accounts and fixtures are synthetic and must not be used as production credentials or data.

Useful endpoints:

- Application health: `GET http://localhost:3000/api/health`
- ShiftOps health: `GET http://localhost:3000/api/shiftops/health`
- Manager UI: `http://localhost:5173/shiftops`

## Validation commands

```powershell
npm run test:readiness
npm run submission:check
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Set `DATABASE_TESTS=true` with a reachable PostgreSQL `DATABASE_URL` to execute the database integration suite. A skipped database test is not a pass.

The latest verified integration commit before this documentation cleanup is `e6bae759476ce9340f27957c20eff1f4937befab`. GitHub Actions run [38827402353](https://github.com/123114-robot/shiftops-ai-act3/actions/runs/38827402353) completed successfully on 16 October 2026 with PostgreSQL-backed CI. Current local and CI evidence is tracked in [docs/STATUS.md](docs/STATUS.md).

## Demo workflow

1. Start PostgreSQL, apply the schema, seed the documented synthetic data, and run the application.
2. Sign in as the synthetic Manager and open `/shiftops`.
3. Create an incident for an unassigned shift and evaluate candidates.
4. Compare eligible and blocked candidates with their validated reasons.
5. Create a proposal, explicitly approve it, then apply it.
6. Confirm the proposal is `APPLIED`, the incident is resolved, the shift is assigned, and all expected audit actions are displayed.

For a self-cleaning backend scenario, run `npm run demo:verify`. This proves a local deterministic PostgreSQL workflow only; it is not AMD runtime or public deployment evidence. See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) and [docs/PHASE_10_BROWSER_DEMO_EVIDENCE.md](docs/PHASE_10_BROWSER_DEMO_EVIDENCE.md).

## Current limitations

- Live AMD Token Factory execution is unverified because credentials and an exact available model ID have not been supplied.
- No public deployment or working application URL has been verified.
- Demo video, pitch deck, cover image, and authenticated final submission remain incomplete.
- Source ownership and authority to apply an MIT license remain blocked pending owner confirmation.
- The repository uses a development/CI `prisma db push` strategy and does not yet have a reviewed production migration baseline.
- Remaining dependency advisories and production contention or telemetry evidence require separate work.
- The optional Evolus partner track has not been selected or implemented.

## Source attribution and licensing

ShiftOps AI derives from `123114-robot/ShiftFlow`, source branch `codex/phase-9-basic-dashboard`, commit `6ea907b742c547bd8e8941e64afddf089daf733f`. The original checkout was preserved; this repository began with a new history containing that source snapshot and the documented Phase 0 additions. See [docs/BASELINE_PROVENANCE.md](docs/BASELINE_PROVENANCE.md).

This provenance record does not prove authorship, ownership, or permission to relicense. GitHub currently detects no license for either repository. No MIT license should be added until the owner confirms ownership of the imported code and assets, authority to license the derivative work, and any required third-party attribution.

## Competition state

Phases 0–10 are implemented within their documented boundaries. The project has not yet demonstrated live AMD execution, public deployment, or formal AMD Developer Hackathon ACT III submission. The submission deadline recorded from the user's authenticated lablab.ai event page screenshot is **18 October 2026 at 9:00 PM AEDT**; Codex did not independently access that authenticated screenshot.

See [docs/COMPETITION_REQUIREMENTS.md](docs/COMPETITION_REQUIREMENTS.md), [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md), and [docs/SUBMISSION_DRAFT.md](docs/SUBMISSION_DRAFT.md) before making any public compliance claim.
