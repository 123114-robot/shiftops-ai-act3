# Submission Checklist

Last verified: 2026-10-16 (Australia/Sydney). This checklist separates repository readiness from evidence that must come from authenticated services or real runtime execution.

## Required before submission

- [x] Public GitHub repository: `https://github.com/123114-robot/shiftops-ai-act3`
- [x] README with local setup and run instructions
- [x] Working local prototype and automated tests
- [ ] Confirm team enrollment and AMD AI Developer Program approval in the authenticated event portal
- [ ] Record the selected main challenge in the submission
- [x] Record the authenticated submission cutoff as **18 October 2026, 9:00 PM AEDT**, sourced from the user's authenticated lablab.ai event page screenshot; Codex did not independently inspect the screenshot
- [x] Record owner-confirmed public application URL: `https://shiftops-ai-web.onrender.com`
- [ ] Record a demo video; general lablab guidance says no more than five minutes
- [ ] Export the pitch deck as PDF
- [ ] Add a cover image
- [ ] Resolve source-code licensing: both this repository and its ShiftFlow source currently expose no GitHub-detected license; do not claim MIT compliance until ownership and licensing are confirmed

## AMD evidence gate

- [ ] Approved AMD infrastructure or hardware identified
- [x] Record configured model `MiniCPM5-2B` and provider-returned identifier `self-dploy/MiniCPM5-2B`
- [ ] `AI_MODE=remote`, `AI_PROVIDER=amd-token-factory`, official `AI_BASE_URL`, `AI_API_KEY`, and exact `AI_MODEL` configured outside Git
- [x] One real synthetic grounded explanation request completed through AMD Token Factory without deterministic fallback
- [x] Committed sanitized evidence records UTC timestamp, endpoint host, configured/returned model, latency, grounding result and fallback status: `docs/evidence/amd-token-factory-verified-2026-10-16.json`
- [ ] Demo visibly exercises that same AMD-backed path

Environment variables alone are configuration evidence, not runtime evidence. Mock tests and deterministic fallback do not satisfy the AMD gate.

## Optional Evolus partner gate

Leave `EVOLUS_TRACK` unset unless the team deliberately selects the partner track.

- [ ] Event workspace created with the kickoff code
- [ ] Team AMD vLLM endpoint connected as the main open model
- [ ] At least two named Evolus building blocks used
- [ ] ShiftOps drives Evolus through its API
- [ ] Containerized application demonstrated
- [ ] Workspace configuration, API calls, and usage telemetry retained for review

## Repeatable check

```powershell
$env:REPOSITORY_VISIBILITY='PUBLIC'
npm run submission:check
Remove-Item Env:REPOSITORY_VISIBILITY
```

Supply `AMD_INFERENCE_EVIDENCE_FILE` and `PITCH_DECK_FILE` as paths to real files, plus `WORKING_PROTOTYPE_URL` and `DEMO_VIDEO_URL` as HTTP(S) URLs. Evolus selection requires the five documented `EVOLUS_*_EVIDENCE_FILE` paths. The checker tests existence/URL shape and never prints secret values; human review must still confirm evidence quality.

## Official sources

- Event overview: https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-iii
- Live event page: https://lablab.ai/ai-hackathons/amd-developer-hackathon-act-iii/live
- General submission guidance: https://lablab.ai/guide/ai-hackathons
