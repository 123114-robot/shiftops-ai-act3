# Security Design

- Use adaptive password hashing; never plaintext.
- Sign short-lived JWTs with an environment secret.
- Authenticate before resolving resources; authorise role and ownership server-side.
- Validate bodies, params, and queries.
- Hide stack traces and sensitive records.
- Restrict CORS to the configured frontend.
- Keep .env and credentials out of Git.
- Do not expose employee directories or others' leave to employees.

Phase 2 issues eight-hour JWTs, returns password-free user objects, and uses a uniform invalid-credentials response to reduce account discovery. Seed users share a documented local-only password whose bcrypt hash is stored in PostgreSQL. Frontend route guards improve navigation, but API middleware remains the security boundary.
