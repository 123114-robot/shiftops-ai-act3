# Competition Requirements Audit

Public sources accessed: 2026-10-13. Repository and user-supplied deadline evidence reviewed: 2026-10-16. Primary event source: [AMD Developer Hackathon: ACT III](https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-iii). Live status: [ACT III live page](https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-iii/live). General submission guidance: [lablab.ai AI Hackathons guide](https://lablab.ai/guide/ai-hackathons).

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Registration status | BLOCKED | Account-specific. Public page requires lablab enrollment and AMD AI Developer Program signup/approval; no authenticated account evidence was provided. |
| Event deadline | USER-CONFIRMED / NOT INDEPENDENTLY INSPECTED | The user's authenticated lablab.ai event page screenshot states **18 October 2026, 9:00 PM AEDT**. Codex did not independently access the authenticated screenshot. Enrollment, team state, and portal access remain unverified. |
| Team size | VERIFIED | Event page states 1–6 people. |
| Eligible tracks | VERIFIED | Four main challenge areas are published; Google and Evolus are optional partner technologies. Final ShiftOps track selection is not yet recorded. |
| Pre-existing code reuse | UNVERIFIED | Public page says submissions must be original and MIT-compliant, but the accessible rulebook did not expose detailed reuse timing/attribution rules. Preserve source provenance and confirm in authenticated rules/Discord. |
| AMD requirement | VERIFIED | A meaningful workload must run on approved AMD infrastructure/hardware and be part of the working product shown to judges. |
| AMD inference details | BLOCKED | No cloud allocation, credential, selected open model, vLLM endpoint, or measured inference evidence is available. |
| Working demo | VERIFIED | A working prototype and application URL/platform are listed submission items. |
| Public repository | VERIFIED | Public GitHub is required; `123114-robot/shiftops-ai-act3` was verified public on 2026-10-13. |
| Video | VERIFIED | Video presentation is required; current general guidance says no more than 5 minutes. Event-specific upload constraints should be reconfirmed at submission. |
| Slides | VERIFIED | Slide presentation is required. |
| Judging | VERIFIED | Application of Technology, Presentation, Business Value, and Originality. |
| Evolus eligibility | VERIFIED | Optional partner track; main agent must use an open model served through the team's vLLM endpoint on AMD Developer Cloud. |
| Evolus implementation | NOT SELECTED / BLOCKED | Requires an event workspace, at least two named Evolus building blocks, app-driven API usage, containerized app, public repo, and workspace telemetry review. No track decision, credentials, event code, or workspace evidence is available. |
| License compatibility | BLOCKED | Event page says submissions must be original and MIT-compliant. GitHub reports no detected license for either this repository or the preserved `123114-robot/ShiftFlow` source. Ownership and licensing must be resolved before making a compliance claim. |

## Track decision

No partner track is selected. ShiftOps is conceptually suitable for the Evolus Business Agents track, but compliance must remain BLOCKED until the required workspace, AMD-hosted vLLM endpoint, two genuine building blocks, API calls, containerization, and telemetry evidence are demonstrated.
