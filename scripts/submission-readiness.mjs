import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const present = value => typeof value === 'string' && value.trim().length > 0;
const enabled = value => String(value ?? '').toLowerCase() === 'true';
const evidenceFile = value => present(value) && existsSync(value);
const publicUrl = value => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); }
  catch { return false; }
};
const state = value => ['MISSING', 'PRESENT', 'VALIDATED', 'VERIFIED'].includes(value) ? value : value ? 'PRESENT' : 'MISSING';

export function assessReadiness({ env = {}, repositoryVisibility = 'UNKNOWN', evidence = {} }) {
  const remoteFields = ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'];
  const missingRemote = remoteFields.filter(key => !present(env[key]));
  const remoteConfigured = env.AI_MODE === 'remote' && missingRemote.length === 0;
  const repositoryPublic = repositoryVisibility.toUpperCase() === 'PUBLIC';
  const requiredAssets = ['workingPrototypeUrl', 'demoVideo', 'pitchDeck'];
  const missingAssets = requiredAssets.filter(key => state(evidence[key]) === 'MISSING');
  const unverifiedAssets = requiredAssets.filter(key => state(evidence[key]) !== 'VERIFIED');
  const evolusSelected = enabled(env.EVOLUS_TRACK);
  const evolusEvidence = [
    ['evolusWorkspace', 'event workspace'],
    ['evolusModelConnection', 'AMD-hosted model connection'],
    ['evolusBuildingBlocks', 'two Evolus building blocks'],
    ['evolusApiCalls', 'app-driven API calls'],
    ['evolusTelemetry', 'workspace telemetry'],
  ];
  const missingEvolus = evolusEvidence.filter(([key]) => state(evidence[key]) === 'MISSING').map(([, label]) => label);
  const unverifiedEvolus = evolusEvidence.filter(([key]) => state(evidence[key]) !== 'VERIFIED').map(([, label]) => label);

  const amdState = state(evidence.amdInference);
  const amd = remoteConfigured && amdState === 'VERIFIED'
    ? { status: 'VERIFIED', missing: [] }
    : remoteConfigured
      ? { status: amdState === 'MISSING' ? 'MISSING' : 'REVIEW_REQUIRED', missing: ['verified AMD runtime inference evidence'] }
      : { status: 'BLOCKED', missing: ['AI_MODE=remote', ...missingRemote] };
  const evolus = !evolusSelected
    ? { status: 'NOT_SELECTED', missing: [] }
    : unverifiedEvolus.length === 0
      ? { status: 'VERIFIED', missing: [] }
      : { status: missingEvolus.length ? 'BLOCKED' : 'REVIEW_REQUIRED', missing: missingEvolus.length ? missingEvolus : unverifiedEvolus };
  const assets = {
    status: unverifiedAssets.length === 0 ? 'VERIFIED' : missingAssets.length ? 'MISSING' : 'REVIEW_REQUIRED',
    missing: missingAssets.length ? missingAssets : unverifiedAssets,
  };
  const repository = { status: repositoryPublic ? 'VERIFIED' : 'BLOCKED', missing: repositoryPublic ? [] : ['public GitHub repository'] };
  const local = { status: 'READY', mode: env.AI_MODE === 'remote' ? 'remote' : 'deterministic' };
  const overall = repository.status === 'VERIFIED' && amd.status === 'VERIFIED' && assets.status === 'VERIFIED' && ['NOT_SELECTED', 'VERIFIED'].includes(evolus.status)
    ? 'READY' : 'BLOCKED';

  return {
    overall, local, repository, amd, evolus, assets,
    inputSummary: {
      AI_MODE: env.AI_MODE ?? 'deterministic',
      AI_BASE_URL: present(env.AI_BASE_URL),
      AI_API_KEY: present(env.AI_API_KEY),
      AI_MODEL: present(env.AI_MODEL),
      EVOLUS_TRACK: evolusSelected,
    },
  };
}

function print(report) {
  console.log(`Submission readiness: ${report.overall}`);
  for (const key of ['local', 'repository', 'amd', 'evolus', 'assets']) {
    const item = report[key];
    console.log(`- ${key}: ${item.status}${item.missing?.length ? ` (missing: ${item.missing.join(', ')})` : ''}`);
  }
  console.log('- Secrets: values were not printed or persisted.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const evidence = {
    amdInference: evidenceFile(process.env.AMD_INFERENCE_EVIDENCE_FILE) ? 'PRESENT' : 'MISSING',
    workingPrototypeUrl: publicUrl(process.env.WORKING_PROTOTYPE_URL) ? 'PRESENT' : 'MISSING',
    demoVideo: publicUrl(process.env.DEMO_VIDEO_URL) ? 'PRESENT' : 'MISSING',
    pitchDeck: evidenceFile(process.env.PITCH_DECK_FILE) ? 'PRESENT' : 'MISSING',
    evolusWorkspace: evidenceFile(process.env.EVOLUS_WORKSPACE_EVIDENCE_FILE) ? 'PRESENT' : 'MISSING',
    evolusModelConnection: evidenceFile(process.env.EVOLUS_MODEL_EVIDENCE_FILE) ? 'PRESENT' : 'MISSING',
    evolusBuildingBlocks: evidenceFile(process.env.EVOLUS_BUILDING_BLOCKS_EVIDENCE_FILE) ? 'PRESENT' : 'MISSING',
    evolusApiCalls: evidenceFile(process.env.EVOLUS_API_EVIDENCE_FILE) ? 'PRESENT' : 'MISSING',
    evolusTelemetry: evidenceFile(process.env.EVOLUS_TELEMETRY_EVIDENCE_FILE) ? 'PRESENT' : 'MISSING',
  };
  print(assessReadiness({
    env: process.env,
    repositoryVisibility: process.env.REPOSITORY_VISIBILITY ?? 'UNKNOWN',
    evidence,
  }));
}
