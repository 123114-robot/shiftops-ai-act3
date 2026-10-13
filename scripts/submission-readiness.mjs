import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const present = value => typeof value === 'string' && value.trim().length > 0;
const enabled = value => String(value ?? '').toLowerCase() === 'true';
const evidenceFile = value => present(value) && existsSync(value);
const publicUrl = value => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); }
  catch { return false; }
};

export function assessReadiness({ env = {}, repositoryVisibility = 'UNKNOWN', evidence = {} }) {
  const remoteFields = ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL'];
  const missingRemote = remoteFields.filter(key => !present(env[key]));
  const remoteConfigured = env.AI_MODE === 'remote' && missingRemote.length === 0;
  const repositoryPublic = repositoryVisibility.toUpperCase() === 'PUBLIC';
  const requiredAssets = ['workingPrototypeUrl', 'demoVideo', 'pitchDeck'];
  const missingAssets = requiredAssets.filter(key => !evidence[key]);
  const evolusSelected = enabled(env.EVOLUS_TRACK);
  const evolusEvidence = [
    ['evolusWorkspace', 'event workspace'],
    ['evolusModelConnection', 'AMD-hosted model connection'],
    ['evolusBuildingBlocks', 'two Evolus building blocks'],
    ['evolusApiCalls', 'app-driven API calls'],
    ['evolusTelemetry', 'workspace telemetry'],
  ];
  const missingEvolus = evolusEvidence.filter(([key]) => !evidence[key]).map(([, label]) => label);

  const amd = evidence.amdInference
    ? { status: 'VERIFIED', missing: [] }
    : remoteConfigured
      ? { status: 'UNVERIFIED', missing: ['sanitized AMD runtime inference evidence'] }
      : { status: 'BLOCKED', missing: ['AI_MODE=remote', ...missingRemote] };
  const evolus = !evolusSelected
    ? { status: 'NOT_SELECTED', missing: [] }
    : missingEvolus.length === 0
      ? { status: 'VERIFIED', missing: [] }
      : { status: 'BLOCKED', missing: missingEvolus };
  const assets = { status: missingAssets.length === 0 ? 'READY' : 'INCOMPLETE', missing: missingAssets };
  const repository = { status: repositoryPublic ? 'VERIFIED' : 'BLOCKED', missing: repositoryPublic ? [] : ['public GitHub repository'] };
  const local = { status: 'READY', mode: env.AI_MODE === 'remote' ? 'remote' : 'deterministic' };
  const overall = repository.status === 'VERIFIED' && amd.status === 'VERIFIED' && assets.status === 'READY' && ['NOT_SELECTED', 'VERIFIED'].includes(evolus.status)
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
    amdInference: evidenceFile(process.env.AMD_INFERENCE_EVIDENCE_FILE),
    workingPrototypeUrl: publicUrl(process.env.WORKING_PROTOTYPE_URL),
    demoVideo: publicUrl(process.env.DEMO_VIDEO_URL),
    pitchDeck: evidenceFile(process.env.PITCH_DECK_FILE),
    evolusWorkspace: evidenceFile(process.env.EVOLUS_WORKSPACE_EVIDENCE_FILE),
    evolusModelConnection: evidenceFile(process.env.EVOLUS_MODEL_EVIDENCE_FILE),
    evolusBuildingBlocks: evidenceFile(process.env.EVOLUS_BUILDING_BLOCKS_EVIDENCE_FILE),
    evolusApiCalls: evidenceFile(process.env.EVOLUS_API_EVIDENCE_FILE),
    evolusTelemetry: evidenceFile(process.env.EVOLUS_TELEMETRY_EVIDENCE_FILE),
  };
  print(assessReadiness({
    env: process.env,
    repositoryVisibility: process.env.REPOSITORY_VISIBILITY ?? 'UNKNOWN',
    evidence,
  }));
}
