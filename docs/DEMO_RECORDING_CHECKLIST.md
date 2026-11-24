# ShiftOps AI Demo Recording Checklist

## Before recording

- [ ] Open `https://shiftops-ai-web.onrender.com` in a private browser window.
- [ ] Confirm `https://shiftops-ai-api.onrender.com/api/health` returns `status: ok`.
- [ ] Confirm the Manager login works without displaying or recording the password.
- [ ] Set browser zoom to 100% and hide bookmarks, personal tabs and notifications.
- [ ] Choose Light or Dark Mode and keep it consistent for the take.
- [ ] Check Dashboard, Employees, Weekly Roster, Shifts and ShiftOps Copilot load without errors.
- [ ] Inspect `demo-shift-incident`; note its current assigned employee.
- [ ] Run evaluation once and note a currently eligible replacement, but do not approve or apply during preflight.
- [ ] Confirm sufficient recording disk space and capture resolution of at least 1920×1080 when available.
- [ ] Record screen first; add narration and subtitles afterward.

## During recording

- [ ] Do not expose `DEMO_PASSWORD`, JWTs, database URLs, API keys, browser developer tools or Render environment variables.
- [ ] Keep the Shift ID visible long enough to understand the scenario.
- [ ] Show at least one eligible and one blocked candidate when the live data permits.
- [ ] Capture the explanation source label.
- [ ] Capture explicit approval before Apply.
- [ ] Capture the final proposal status and audit events.
- [ ] Keep total duration below the final event-specific limit; target 3–4 minutes.

## Data safety and repeatability

Applying a proposal changes the public demo database. The seed is intentionally non-destructive and will not reset that shift on redeploy. Use one planned final take. If another take is required, inspect the shift’s new assignment and evaluate a valid alternative; do not delete records or reset the database.

If the seeded scenario no longer provides a clean candidate comparison, use the existing Shifts UI to create a new synthetic future shift through normal Manager controls. Record its generated Shift ID and use only fictional data. Do not run `db:push`, development seed, database reset or direct SQL.

## Failure plan

- If Render is waking from sleep, pause and retry only after health returns `status: ok`.
- If login fails, stop recording and verify the owner-held Demo password outside the capture.
- If evaluation returns no eligible candidates, stop and inspect role, availability, leave and conflicts; do not invent a result.
- If an apply attempt fails revalidation, explain nothing on camera; prepare another valid synthetic scenario and restart the take.
- If the explanation label says deterministic fallback or deterministic, narrate it exactly that way.

## After recording

- [ ] Remove silent waiting, failed attempts and any frame containing credentials.
- [ ] Add the approved English narration and concise subtitles.
- [ ] Verify repository and application URLs.
- [ ] Watch the exported file end to end with audio.
- [ ] Confirm every AMD claim matches the committed evidence boundary.
- [ ] Record the final video URL in `docs/SUBMISSION_CHECKLIST.md` before submission.
