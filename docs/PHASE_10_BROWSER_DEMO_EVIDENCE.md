# Phase 10 Browser Demo Evidence

Verified: 2026-10-16 (Australia/Sydney)

## Scope

Phase 10 verifies the existing Manager workflow through a real local browser, frontend, Express API, and PostgreSQL database. It does not introduce a new scheduling workflow or relax authentication, Manager RBAC, deterministic eligibility, explicit approval, or transactional apply.

This is local browser evidence only. It is not proof of a public deployment or AMD Token Factory execution.

## Environment

- Branch: `feature/phase-10-browser-demo-evidence`
- Browser target: `http://localhost:5173`
- API target: `http://localhost:3000/api`
- Database: local PostgreSQL 17 container
- AI mode: deterministic
- Data: synthetic development users and one temporary synthetic shift

## Browser workflow — VERIFIED

The following actions were completed through the rendered application UI:

1. Signed in with the documented synthetic Manager account.
2. Created one unassigned `Chef` shift for 2026-10-19, 09:00–17:00.
3. Created an incident and evaluated replacement candidates.
4. Observed one `ELIGIBLE` candidate, two `BLOCKED` candidates, and exactly one proposal action.
5. Created the proposal and observed `PENDING_APPROVAL`.
6. Explicitly approved it and observed `APPROVED`.
7. Applied the approved proposal and observed `APPLIED`.
8. Observed all four audit actions: `INCIDENT_CREATED`, `PROPOSAL_CREATED`, `PROPOSAL_APPROVED`, and `PROPOSAL_APPLIED`.
9. Observed the explanation label `[Source: deterministic]`.

## Database cross-check — VERIFIED

PostgreSQL recorded the same outcome for the temporary fixture:

- Shift: `SCHEDULED`
- Shift employee: the eligible employee selected in the browser
- Proposal: `APPLIED`
- Incident: `RESOLVED`

Cleanup then removed exactly four audit events, one proposal, one incident, and one shift. A final query returned zero rows for the temporary shift ID.

The milestone regression then passed with PostgreSQL enabled: 95/95 backend tests across 25 files with zero skips, 17/17 frontend tests, readiness 5/5, lint, typecheck, production build, and `git diff --check`.

## Diagnostic note

The first login attempt failed because the development server process had been started without `DATABASE_URL`. Backend logs identified Prisma configuration failure. The server was restarted with the documented local database URL and a local-only JWT secret; the same browser login then succeeded. No authentication logic or RBAC rule was changed.

## Evidence boundary

- VERIFIED: local rendered Manager workflow, API integration, PostgreSQL persistence, explicit approval, apply result, audit display, and synthetic cleanup.
- NOT AMD EVIDENCE: the visible explanation source was deterministic and no AMD credential or model was configured.
- NOT DEPLOYMENT EVIDENCE: localhost is not a publicly reachable application URL.
- NOT SUBMISSION EVIDENCE: no video, deck, portal action, deployment, or competition submission was performed.
