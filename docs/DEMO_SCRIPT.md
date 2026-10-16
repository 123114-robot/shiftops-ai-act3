# Five-minute Demo Script

Before recording, run the local PostgreSQL evidence scenario with synthetic data:

```powershell
$env:DATABASE_URL='postgresql://shiftflow:shiftflow_dev@localhost:5432/shiftflow?schema=public'
$env:DEMO_EVIDENCE_FILE='demo-evidence.json'
npm run demo:verify
Remove-Item Env:DEMO_EVIDENCE_FILE
Remove-Item Env:DATABASE_URL
```

The command creates and removes its own synthetic records. It verifies one eligible machine operator, one role-blocked candidate, Manager approval, atomic apply, four audit actions, and a one-shift reduction in the backend-derived unfilled-shift KPI. The generated file proves only a local deterministic PostgreSQL workflow; it is not AMD, browser, deployment, or production evidence.

## 0:00–0:30 — Problem

Introduce an unfilled shift and the operations manager who must find a safe replacement quickly. State that the demo uses synthetic employee data.

## 0:30–1:00 — Trust boundary

Show the architecture slide: deterministic backend rules decide eligibility; the model explains only validated facts; the manager approves; the database records the result.

## 1:00–2:15 — Candidate evaluation

Sign in as a Manager, open ShiftOps, create an incident for an existing shift, and evaluate candidates. Point out one eligible candidate and one blocked candidate with the exact blocker.

## 2:15–3:15 — Grounded explanation

Create the proposal. Show the explanation and identify the actual AMD-hosted model and endpoint environment on screen. If real AMD inference has not been verified, do not describe this step as AMD-powered; use deterministic mode and label it honestly.

## 3:15–4:00 — Human approval and mutation

Approve, apply, and show the changed assignment. Explain apply-time revalidation, optimistic concurrency, and the atomic audit write.

## 4:00–4:30 — Audit trail and failure behavior

Show the four audit actions (`INCIDENT_CREATED`, `PROPOSAL_CREATED`, `PROPOSAL_APPROVED`, and `PROPOSAL_APPLIED`). Briefly describe what happens when a candidate becomes ineligible or the model times out.

## 4:30–5:00 — Business value and evidence

Show the backend-derived unfilled-shift count falling by one after apply. State that time-to-replacement remains a proposed metric until real user sessions are measured, then state the current limitations, public repository, and working application URL. Avoid unmeasured savings or unsupported compliance claims.
