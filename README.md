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

One bounded real Token Factory request is **VERIFIED** by the committed sanitized record in `docs/evidence/amd-token-factory-verified-2026-10-16.json`: configured model `MiniCPM5-2B`, provider-returned identifier `self-dploy/MiniCPM5-2B`, grounding passed, 3305 ms latency, and no deterministic fallback. This does not prove general AMD hardware/account compliance or AMD execution in the public Render demo, which remains deterministic. See [docs/AMD_TOKEN_FACTORY.md](docs/AMD_TOKEN_FACTORY.md).

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

The current delivery branch is `feature/shiftops-ui-ux-redesign`; the owner-confirmed deployed source commit is `7edfe2183d0502f55a343056f3d34c45bbe3b716`. Earlier GitHub Actions run [38827402353](https://github.com/123114-robot/shiftops-ai-act3/actions/runs/38827402353) completed successfully on 16 October 2026 with PostgreSQL-backed CI. Current evidence is tracked in [docs/STATUS.md](docs/STATUS.md).

## Public demo access

The public hackathon demo contains synthetic data only and is available for judges and visitors to explore:

- Application: <https://shiftops-ai-web.onrender.com>
- Manager email: `manager@shiftflow.local`
- Demo password: `1098765432123`

The Render free-tier API may take approximately 50 seconds to wake on the first request. If the first sign-in attempt times out, wait briefly, refresh the page, and sign in again.

This is a shared demonstration environment. Changes made through the Manager account may remain visible to later visitors. Do not enter personal, confidential, or production data.

Suggested walkthrough:

1. Sign in with the public Manager account.
2. Review the Dashboard, Employees, Weekly Roster, Shifts, and Leave Requests pages.
3. Open **ShiftOps Copilot**.
4. Enter Shift ID `demo-shift-incident` and a synthetic incident reason.
5. Evaluate candidates and review the deterministic eligibility reasons.
6. Create a proposal, approve it, apply it, and inspect the Audit history.

The public Render demo uses deterministic explanations. Do not interpret its output as a live AMD inference result.

## Demo workflow

1. Start PostgreSQL, apply the schema, seed the documented synthetic data, and run the application.
2. Sign in as the synthetic Manager and open `/shiftops`.
3. Create an incident for an unassigned shift and evaluate candidates.
4. Compare eligible and blocked candidates with their validated reasons.
5. Create a proposal, explicitly approve it, then apply it.
6. Confirm the proposal is `APPLIED`, the incident is resolved, the shift is assigned, and all expected audit actions are displayed.

For a self-cleaning backend scenario, run `npm run demo:verify`. This proves a local deterministic PostgreSQL workflow only; it is not AMD runtime or public deployment evidence. See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) and [docs/PHASE_10_BROWSER_DEMO_EVIDENCE.md](docs/PHASE_10_BROWSER_DEMO_EVIDENCE.md).

Owner-confirmed public application: `https://shiftops-ai-web.onrender.com`. Recording guidance is in [the storyboard](docs/DEMO_VIDEO_STORYBOARD.md), [English narration](docs/DEMO_VIDEO_NARRATION.md), and [recording checklist](docs/DEMO_RECORDING_CHECKLIST.md).

## Current limitations

- One real Token Factory request is verified, but AMD enrollment/general hardware compliance and AMD use in the public deterministic demo remain unverified.
- The public deployment is owner-confirmed; formal public end-to-end workflow UAT has not been recorded.
- Demo video, pitch deck, and cover artwork are available in [`submission-assets/`](submission-assets/); authenticated final submission remains owner-operated.
- Source ownership and authority to apply an MIT license remain blocked pending owner confirmation.
- Local development/CI may use `prisma db push`; Render uses the committed Prisma migration baseline and guarded idempotent demo seed.
- Remaining dependency advisories and production contention or telemetry evidence require separate work.
- The optional Evolus partner track has not been selected or implemented.

## Source attribution and licensing

ShiftOps AI derives from `123114-robot/ShiftFlow`, source branch `codex/phase-9-basic-dashboard`, commit `6ea907b742c547bd8e8941e64afddf089daf733f`. The original checkout was preserved; this repository began with a new history containing that source snapshot and the documented Phase 0 additions. See [docs/BASELINE_PROVENANCE.md](docs/BASELINE_PROVENANCE.md).

This provenance record does not prove authorship, ownership, or permission to relicense. GitHub currently detects no license for either repository. No MIT license should be added until the owner confirms ownership of the imported code and assets, authority to license the derivative work, and any required third-party attribution.

## Competition state

Phases 0–10 and the UI/UX redesign are implemented within their documented boundaries. The owner confirms the public Render deployment, and one bounded real AMD Token Factory request is recorded. Public workflow UAT, submission assets and formal AMD Developer Hackathon ACT III submission remain incomplete. The submission deadline recorded from the user's authenticated lablab.ai event page screenshot is **18 October 2026 at 9:00 PM AEDT**; Codex did not independently access that authenticated screenshot.

See [docs/FINAL_SUBMISSION_STATUS.md](docs/FINAL_SUBMISSION_STATUS.md), [docs/COMPETITION_REQUIREMENTS.md](docs/COMPETITION_REQUIREMENTS.md), [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md), and [docs/SUBMISSION_DRAFT.md](docs/SUBMISSION_DRAFT.md) before making any public compliance claim.
