# Five-minute Demo Script

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

Show the audit record. Briefly describe what happens when a candidate becomes ineligible or the model times out.

## 4:30–5:00 — Business value and evidence

State the intended time-to-replacement metric, current limitations, public repository, and working application URL. Avoid unmeasured savings or unsupported compliance claims.
