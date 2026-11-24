# ShiftOps AI Submission Draft

Status: DRAFT — do not submit until every bracketed field and evidence gate is resolved.

Repository snapshot: Phases 0–10 are merged in integration commit `e6bae759476ce9340f27957c20eff1f4937befab`; GitHub Actions run `38827402353` passed. This is repository evidence only, not proof of live AMD inference, deployment, or submission.

Submission deadline: **18 October 2026, 9:00 PM AEDT**, sourced from the user's authenticated lablab.ai event page screenshot. Codex did not independently inspect that authenticated screenshot.

## Project title

ShiftOps AI — Human-approved workforce recovery copilot

## Short description

ShiftOps AI helps operations managers recover from unfilled shifts. Deterministic scheduling rules identify eligible replacements, a grounded model explains the recommendation, and a manager must explicitly approve every schedule change.

## Long description

When a worker becomes unavailable, managers often compare availability, leave, overlapping shifts, role fit, and weekly-hour limits manually. ShiftOps AI turns that process into an auditable workflow: create an incident, evaluate candidates against backend-owned rules, review grounded reasons, create a proposal, approve or reject it, and apply the approved change transactionally.

The language model is deliberately non-authoritative. It receives only validated candidate facts and may explain them; it cannot decide eligibility, approve a proposal, or mutate the schedule. Invalid or unavailable model output falls back to a deterministic explanation.

## Intended user and value

- User: workforce or operations manager
- Problem: slow, error-prone replacement decisions after a staffing disruption
- Proposed measurement: median time from incident creation to approved replacement, plus rate of proposals rejected because of stale or invalid eligibility
- Current evidence: workflow and automated-test evidence only; no production time-saving study has been run

## Technology

- React, TypeScript, Vite
- Express, Prisma, PostgreSQL
- Deterministic eligibility engine and auditable approval state machine
- OpenAI-compatible grounded explanation adapter
- AMD runtime: `[UNVERIFIED — add actual AMD infrastructure, model, server, and measured evidence]`
- Evolus: `[NOT SELECTED unless the partner gate is completed]`

## Challenge and links

- Selected challenge: `[REQUIRED]`
- Public repository: https://github.com/123114-robot/shiftops-ai-act3
- Working application: `[REQUIRED URL]`
- Demo video: `[REQUIRED URL]`
- Pitch deck: `[REQUIRED URL/PDF]`
- Cover image: `[REQUIRED]`

## Safety and trust

- Backend rules remain authoritative.
- Manager authentication and role checks protect the workflow.
- Eligibility is revalidated immediately before apply.
- Schedule update and audit write occur transactionally.
- Provider failures cannot bypass human approval or deterministic validation.
