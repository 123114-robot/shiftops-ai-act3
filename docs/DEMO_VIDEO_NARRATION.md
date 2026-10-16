# ShiftOps AI Demo Narration

## 0:00–0:20 — Introduction

“ShiftOps AI is a human-approved workforce recovery copilot from Synqvera Labs. It helps operations managers move from a staffing incident to a safe, traceable schedule change.”

## 0:20–0:45 — Dashboard

“The Manager dashboard summarizes today’s workforce state, including working employees, unfilled shifts, approved leave and scheduled hours. These values come from the backend, not hard-coded presentation data.”

## 0:45–1:10 — Workforce context

“Managers can review employee roles, status and contact details, then inspect recurring availability. These records become deterministic inputs to scheduling eligibility.”

## 1:10–1:30 — Roster and shifts

“The Weekly Roster supports day, week, month and custom date ranges. The shift list provides the operational record we will use for this recovery scenario.”

## 1:30–2:15 — Incident and candidate evaluation

“In ShiftOps Copilot, I identify the affected shift and describe the incident. The backend evaluates replacement candidates against active status, availability, role requirements, leave, shift conflicts and configured working-hour limits. Eligible and blocked candidates are shown with explicit reasons.”

## 2:15–2:40 — Grounded explanation

“I select an eligible candidate and create a staffing proposal. The explanation is grounded only in facts already validated by the scheduling engine. In this public demo, the source label is deterministic. Separately, the repository contains sanitized evidence of one successful grounded AMD Token Factory request using MiniCPM5-2B without fallback.”

## 2:40–3:05 — Human approval and apply

“The proposal cannot change the roster by itself. A Manager must explicitly approve it. When I apply the approved proposal, the backend revalidates eligibility and performs the schedule mutation transactionally.”

## 3:05–3:25 — Audit trail

“The audit history records the incident, proposal, approval and application. This creates a traceable chain from operational problem to authorized resolution.”

## 3:25–3:30 — Close

“ShiftOps AI combines deterministic workforce safeguards, grounded explanations, human control and auditable execution.”

## Claims to avoid

- Do not say the public Render walkthrough is using live AMD inference.
- Do not claim automatic scheduling or autonomous approval.
- Do not claim measured time or cost savings without evidence.
- Do not describe the prototype as production-ready.
