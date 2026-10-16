# ShiftOps AI Demo Video Storyboard

Target: 3 minutes 30 seconds, English narration, public Render demo.

Public application: `https://shiftops-ai-web.onrender.com`

## Recording sequence

| Time | Screen and action | Evidence to show |
| --- | --- | --- |
| 0:00–0:20 | Title card, then Manager login | ShiftOps AI, Synqvera Labs, “Intelligent Workforce Recovery” |
| 0:20–0:45 | Dashboard | Working Today, Unfilled Shifts, Approved Leave and Scheduled Hours are backend-derived |
| 0:45–1:10 | Employees → one employee → Availability | Active status, role, employee details and recurring availability |
| 1:10–1:30 | Weekly Roster | Current period, period controls and real scheduled shifts |
| 1:30–1:50 | Shifts | Identify the preflight-selected shift and copy its Shift ID |
| 1:50–2:15 | ShiftOps Copilot → enter Shift ID and incident reason → Create incident and evaluate | Eligible and blocked candidates, scores and deterministic reason codes |
| 2:15–2:40 | Select an eligible candidate → create proposal | Explanation and its visible source label |
| 2:40–3:05 | Approve proposal → Apply approved proposal | Human approval is required before the authoritative schedule changes |
| 3:05–3:25 | Audit history | Incident, proposal, approval and apply events |
| 3:25–3:30 | Closing title | Public URL and repository URL |

## Truthful AI wording

The public Render service is configured with `AI_MODE=deterministic`. In the recording, call the visible explanation “grounded” or “deterministic” according to its source label. Do not call the public response live AMD inference.

Separately, the project has one verified real AMD Token Factory request recorded in `docs/evidence/amd-token-factory-verified-2026-10-16.json`. Present that as integration evidence, not as proof that this public recording used remote AMD inference.

## Preflight-selected data

The seed provides the stable shift ID `demo-shift-incident`, synthetic Manager `manager@shiftflow.local`, fictional employees and recurring availability. Before recording, confirm the current assignment and run candidate evaluation once without approving or applying. Record the eligible candidate displayed by the live database; do not assume a specific employee after earlier demo runs.
