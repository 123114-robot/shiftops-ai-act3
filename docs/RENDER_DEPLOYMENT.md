# ShiftOps AI Render Demo Deployment

Date: 2026-10-16 (Australia/Sydney)

Status: deployment configuration prepared and locally verified. The existing Render PostgreSQL resource is preserved; Codex has not created or deployed any Render service.

## Existing resources and topology

- Existing database: `shiftops-ai-db`, PostgreSQL Free, Oregon, database name `shiftops_ai`.
- Web Service: `shiftops-ai-api`, Node Free, Oregon.
- Static Site: `shiftops-ai-web`, React/Vite.

The root `render.yaml` defines only the Static Site and Web Service. It intentionally has no `databases` block, so applying it cannot request a second PostgreSQL database. The API remains in `AI_MODE=deterministic`; this deployment does not establish live AMD inference evidence.

## Settings to paste into Render

Leave **Root Directory blank** for both services and select branch `chore/render-demo-deployment`.

### Web Service

- Region: `Oregon`
- Runtime: `Node`
- Plan: `Free`
- Build Command:

```text
npm ci && npm run db:generate && npm run build -w backend
```

- Start Command:

```text
npm run db:deploy -w backend && npm run db:seed:demo -w backend && npm run start -w backend
```

- Health Check Path: `/api/health`
- Auto-Deploy: disabled until owner acceptance

Render Free Web Services do not provide the required Pre-Deploy Command here. The Start Command therefore performs three ordered operations: deploy committed Prisma migrations, run the guarded idempotent synthetic seed, then start Express. If migration or seed fails, `&&` prevents the application from starting in a partially initialized state.

On later restarts or redeploys, `prisma migrate deploy` skips migrations already recorded by Prisma and `db:seed:demo` preserves existing matching records. It does not reset passwords, employee status, availability, shift state or leave state, and stable IDs prevent duplicate demo shift and leave rows.

### Static Site

- Build Command:

```text
npm ci && npm run build -w frontend
```

- Publish Directory: `frontend/dist`
- Rewrite Rule: `/*` to `/index.html`
- Auto-Deploy: disabled until owner acceptance

## Environment variables

### Web Service

Add these in the Web Service dashboard:

- `DATABASE_URL`: use the **Internal Database URL** from the existing `shiftops-ai-db`; do not create another database.
- `JWT_SECRET`: a new strong random secret generated/stored only in Render.
- `FRONTEND_URL`: the final Static Site origin, for example `https://shiftops-ai-web.onrender.com`, with no trailing slash.
- `DEMO_SEED_ENABLED=true`.
- `DEMO_PASSWORD`: an owner-selected Demo-only password of at least 12 characters, stored only in Render.
- `AI_MODE=deterministic`.
- `AI_PROVIDER=amd-token-factory`.
- `SHIFTOPS_MAX_WEEKLY_MINUTES=2400`.
- `SHIFTOPS_REQUIRE_ROLE_MATCH=true`.

Do not set `PORT`; Render supplies it. Do not configure an AMD key for this deterministic demo.

### Static Site

- `VITE_API_URL`: final Web Service URL plus `/api`, for example `https://shiftops-ai-api.onrender.com/api`.

Never put `JWT_SECRET`, `DATABASE_URL`, AMD credentials, demo passwords or authorization headers in Git, screenshots, frontend variables or build logs.

## Database safety

The committed migration is intended for this new, empty Render demo database. The production path uses only `prisma migrate deploy` through `npm run db:deploy`; it does not use `prisma db push`, reset the database or run the development seed.

The demo seed:

- refuses to run unless `DEMO_SEED_ENABLED=true`;
- refuses passwords shorter than 12 characters;
- uses stable IDs and no-op updates for existing synthetic rows;
- creates only fictional users, availability, one shift and one leave request;
- never deletes, truncates or overwrites existing records;
- can be run on every service start without duplicating or resetting demo data.

Public synthetic Manager login:

- Email: `manager@shiftflow.local`
- Password: the owner-selected `DEMO_PASSWORD` stored only in Render.

This credential is intentionally for a public synthetic demo and must never be reused for real accounts or real data.

## Manual deployment sequence

1. Open the existing `shiftops-ai-db` and copy its **Internal Database URL**.
2. In the manually created Web Service, select repository `123114-robot/shiftops-ai-act3` and branch `chore/render-demo-deployment`.
3. Enter the Web Service settings and environment variables exactly as listed above, using the existing database URL.
4. Deploy the Web Service. Its Start Command applies migrations, safely seeds synthetic records and then starts the API.
5. Verify `https://<api-host>/api/health` returns HTTP 200 with `status: ok`.
6. Create/configure the Static Site with the settings above and set `VITE_API_URL` to the actual API URL plus `/api`.
7. Set the Web Service `FRONTEND_URL` to the actual Static Site origin and redeploy the Web Service if this value changed.
8. Open the Static Site in a private window and perform the acceptance flow below.
9. Record the deployed commit SHA and both public URLs before enabling automatic deploys.

Do not choose **New PostgreSQL** and do not import a Blueprint that proposes a database resource.

## Public demo acceptance flow

1. Sign in with the synthetic Manager account.
2. Confirm Dashboard loads backend-derived values.
3. Open **Shifts** and confirm the synthetic Chef shift exists.
4. Open **ShiftOps Copilot**.
5. Enter Shift ID `demo-shift-incident` and reason `Assigned employee unavailable`.
6. Select **Create incident and evaluate**.
7. Confirm Casey Lee is eligible and role-mismatched employees remain blocked.
8. Create the Casey proposal and confirm the explanation source is deterministic.
9. Approve and apply the proposal.
10. Confirm the proposal reaches `APPLIED`, the assignment changes and audit history contains incident, proposal, approval and apply events.

Do not describe this as live AMD inference. It proves only the deployed deterministic, human-approved workflow.

## Rollback

- Application: redeploy the previously recorded commit.
- Database: migrations are additive and no automated rollback SQL is provided. Do not reset or delete the existing database.
- To take the demo offline, suspend the Static Site and Web Service. Database deletion requires separate owner approval.
