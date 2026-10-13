import assert from 'node:assert/strict';
import test from 'node:test';
import { assessReadiness } from './submission-readiness.mjs';

test('reports a deterministic local build as ready while blocking unproven external claims', () => {
  const report = assessReadiness({
    env: { AI_MODE: 'deterministic' },
    repositoryVisibility: 'PUBLIC',
    evidence: {},
  });

  assert.equal(report.local.status, 'READY');
  assert.equal(report.repository.status, 'VERIFIED');
  assert.equal(report.amd.status, 'BLOCKED');
  assert.equal(report.evolus.status, 'NOT_SELECTED');
  assert.equal(report.overall, 'BLOCKED');
});

test('requires runtime evidence in addition to remote configuration', () => {
  const configured = assessReadiness({
    env: {
      AI_MODE: 'remote', AI_BASE_URL: 'https://example.invalid/v1', AI_API_KEY: 'secret', AI_MODEL: 'model',
    },
    repositoryVisibility: 'PUBLIC',
    evidence: {},
  });
  assert.equal(configured.amd.status, 'UNVERIFIED');
  assert.ok(!JSON.stringify(configured).includes('secret'));

  const verified = assessReadiness({
    env: { AI_MODE: 'remote', AI_BASE_URL: 'set', AI_API_KEY: 'set', AI_MODEL: 'set' },
    repositoryVisibility: 'PUBLIC',
    evidence: { amdInference: true, workingPrototypeUrl: true, demoVideo: true, pitchDeck: true },
  });
  assert.equal(verified.amd.status, 'VERIFIED');
  assert.equal(verified.overall, 'READY');
});

test('marks Evolus selected but blocked until every partner requirement has evidence', () => {
  const report = assessReadiness({
    env: { AI_MODE: 'remote', AI_BASE_URL: 'set', AI_API_KEY: 'set', AI_MODEL: 'set', EVOLUS_TRACK: 'true' },
    repositoryVisibility: 'PUBLIC',
    evidence: { amdInference: true, workingPrototypeUrl: true, demoVideo: true, pitchDeck: true },
  });
  assert.equal(report.evolus.status, 'BLOCKED');
  assert.match(report.evolus.missing.join(' '), /workspace telemetry/);
});
