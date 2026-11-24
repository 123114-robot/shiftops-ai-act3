# UI/UX Browser Evidence

Date: 2026-10-16 (Australia/Sydney)

Environment: local Vite frontend, local API and healthy Docker PostgreSQL

Account: synthetic Manager development account

## Observed

- Manager login reached `/dashboard` successfully.
- Dashboard rendered the Manager-only navigation, four backend-derived zero KPI values and the truthful no-activity state.
- Dark theme rendered on initial authenticated load from the existing browser preference/state.
- Theme toggle changed the application to light mode; subsequent page navigation retained the manual light selection.
- Employee page rendered four database-backed records as narrow-screen cards with active/inactive badges plus view and deactivate/reactivate actions.
- Weekly Roster rendered Week mode, current/previous/month/recent/history presets, selected-period navigation and the empty-state Create Shift action.
- The approximately 350 px in-app browser view exercised the narrow responsive layout. The navigation remains horizontally scrollable by design.

## Not performed

- No employee, shift, leave, availability, incident or proposal data was created, edited, deactivated, reactivated, cancelled or applied during this browser pass.
- Owner acceptance was not performed.
- Wide-screen visual review and cross-browser testing were not performed.
- No AMD request was executed; this evidence says nothing about live AMD inference.

## Screenshot location

Dashboard dark/light, employee list and Weekly Roster screenshots were captured in the current Codex browser session. They were not written into the repository, avoiding generated binary churn; this Markdown record is the repository evidence index.
