# AMD Token Factory Integration

Last reviewed: 2026-10-14 (Australia/Sydney).

## Official contract

ShiftOps uses AMD Radeon Cloud Token Factory's documented OpenAI-compatible contract:

- Base URL: `https://developer.amd.com.cn/radeon/api/v1`
- Endpoint: `POST /chat/completions`
- Authentication: `Authorization: Bearer <API key>`
- Model: copy the exact current model identifier from the Token Factory model dialog
- Key storage: server-side environment or secret manager only

Primary sources:

- AMD contest Radeon Cloud guide: `https://github.com/AMD-DEV-CONTEST/Radeon-hackathon-2026-07/blob/main/Radeon-Cloud-User%20Guide/README.md`
- AMD Radeon Cloud authentication: `https://amd-aim.github.io/radeon-cloud-docs/api/authentication/`
- AMD Radeon Cloud Token Factory: `https://developer.amd.com.cn/radeon/modelapis`

The public contract documents ordinary JSON chat completions but does not promise `response_format` support. The AMD adapter therefore requests JSON in the system prompt and validates the returned JSON locally; it does not send `response_format`.

## Architecture

No scheduling or approval system is duplicated. The existing flow remains:

```text
deterministic eligibility -> selected validated candidate facts
  -> AMD Token Factory adapter -> strict schema/model/reason validation
  -> locally rendered explanation -> Manager approval -> transactional apply
```

AMD receives only the synthetic identifiers and validated scheduling reason codes needed to select an explanation style. It cannot change eligibility, approve a proposal, or write to PostgreSQL.

Every stored/displayed explanation carries one locally generated source label:

- `[Source: AMD Token Factory; model: ...]` only after a valid AMD response whose returned model matches `AI_MODEL`.
- `[Source: deterministic fallback]` when the remote call or validation fails.
- `[Source: deterministic]` when remote mode is disabled.
- `[Source: mocked test response; model: ...]` only for an explicitly identified test provider.

Successful remote calls also emit a structured server log named `shiftops_ai_inference` containing provider, configured and returned model, sanitized request ID when available, latency, and outcome. It contains no API key, request prompt, employee PII, or endpoint path.

## Server configuration

```dotenv
AI_MODE=remote
AI_PROVIDER=amd-token-factory
AI_BASE_URL=https://developer.amd.com.cn/radeon/api/v1
AI_API_KEY=<Token Factory key; never commit>
AI_MODEL=<exact model ID from Token Factory>
AI_TIMEOUT_SECONDS=30
```

`AI_BASE_URL` may be omitted for this provider; the server uses the official shared Token Factory URL. A different URL is rejected so a generic or mocked endpoint cannot be labelled AMD Token Factory.

## Reproducible live evidence

Use a synthetic fixture only. The command refuses to overwrite an existing evidence file.

```powershell
$env:AI_API_KEY='<secret>'
$env:AI_MODEL='<exact Token Factory model ID>'
$env:AI_PROVIDER='amd-token-factory'
$env:AI_MODE='remote'
$env:AMD_INFERENCE_EVIDENCE_FILE='amd-token-factory-evidence.json'
npm run amd:verify -w backend
Remove-Item Env:AI_API_KEY
```

The output contains a timestamp, commit, endpoint host, configured/returned model, safe request ID when supplied, latency, grounding result, fallback status, and a hash of the locally rendered explanation. It never persists the key or raw prompt.

## Current evidence status

**UNVERIFIED:** as of 2026-10-16, no `AI_API_KEY`, `AI_MODEL`, or successful live Token Factory request was available in the implementation environment. Unit tests use mocked HTTP responses and are not AMD runtime evidence. The adapter and its Phase 7 pull request are merged, but merge and CI status do not prove live AMD execution. Do not mark the readiness gate `VERIFIED` until the command above succeeds with a real key/model and a human reviews the generated record plus Token Factory account/runtime evidence.
