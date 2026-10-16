import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import {
  AMD_TOKEN_FACTORY_BASE_URL,
  DeterministicExplanationProvider,
  GroundedExplanationProvider,
  OpenAICompatibleExplanationProvider,
  type ExplanationTrace,
} from '../src/shiftops/ShiftOpsExplanationProvider.js';

const apiKey = process.env.AI_API_KEY ?? '';
const model = process.env.AI_MODEL ?? '';
const baseUrl = process.env.AI_BASE_URL || AMD_TOKEN_FACTORY_BASE_URL;
const timeoutSeconds = Number(process.env.AI_TIMEOUT_SECONDS ?? '30');

if (!apiKey || !model) {
  throw new Error('AI_API_KEY and AI_MODEL are required. Values are never printed or persisted.');
}

let trace: ExplanationTrace | undefined;
const remote = new OpenAICompatibleExplanationProvider({
  baseUrl,
  apiKey,
  model,
  timeoutMs: timeoutSeconds * 1_000,
  provider: 'amd-token-factory',
  supportsResponseFormat: true,
});
const grounded = new GroundedExplanationProvider(
  remote,
  new DeterministicExplanationProvider('deterministic-fallback'),
  value => { trace = value; },
);

const explanation = await grounded.explain({
  shiftId: 'synthetic-amd-evidence-shift',
  employeeId: 'synthetic-amd-evidence-employee',
  score: 480,
  reasons: ['ACTIVE', 'AVAILABLE', 'NO_OVERLAP', 'NO_APPROVED_LEAVE', 'WITHIN_WEEKLY_LIMIT'],
});

if (!trace || trace.source !== 'amd-token-factory') {
  throw new Error('AMD Token Factory did not return a grounded response; deterministic fallback was used.');
}

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const evidence = {
  schemaVersion: 1,
  verificationStatus: 'VERIFIED_AMD_TOKEN_FACTORY_REQUEST',
  verifiedAtUtc: new Date().toISOString(),
  gitCommit: commit,
  provider: 'AMD Radeon Cloud Token Factory',
  endpointHost: new URL(baseUrl).host,
  configuredModel: trace.configuredModel,
  responseModel: trace.responseModel,
  requestId: trace.requestId ?? null,
  latencyMs: trace.latencyMs,
  groundingValidation: 'PASSED',
  deterministicFallbackUsed: false,
  fixture: 'synthetic-only',
  explanationSha256: createHash('sha256').update(explanation).digest('hex'),
  scope: 'Proves one successful grounded Token Factory request only; does not prove enrollment, production readiness, or general AMD hardware compliance.',
};

const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
const outputPath = process.env.AMD_INFERENCE_EVIDENCE_FILE;
if (outputPath) {
  writeFileSync(outputPath, serialized, { encoding: 'utf8', flag: 'wx' });
}
process.stdout.write(serialized);
