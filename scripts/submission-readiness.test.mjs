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
      AI_MODE: 'remote', AI_PROVIDER: 'amd-token-factory',
      AI_BASE_URL: 'https://developer.amd.com.cn/radeon/api/v1', AI_API_KEY: 'secret', AI_MODEL: 'model',
    },
    repositoryVisibility: 'PUBLIC',
    evidence: {},
  });
  assert.equal(configured.amd.status, 'MISSING');
  assert.ok(!JSON.stringify(configured).includes('secret'));

  const verified = assessReadiness({
    env: {
      AI_MODE: 'remote', AI_PROVIDER: 'amd-token-factory',
      AI_BASE_URL: 'https://developer.amd.com.cn/radeon/api/v1', AI_API_KEY: 'set', AI_MODEL: 'set',
    },
    repositoryVisibility: 'PUBLIC',
    evidence: { amdInference: 'VERIFIED', workingPrototypeUrl: 'VERIFIED', demoVideo: 'VERIFIED', pitchDeck: 'VERIFIED' },
  });
  assert.equal(verified.amd.status, 'VERIFIED');
  assert.equal(verified.overall, 'READY');
});

test('marks Evolus selected but blocked until every partner requirement has evidence', () => {
  const report = assessReadiness({
    env: {
      AI_MODE: 'remote', AI_PROVIDER: 'amd-token-factory',
      AI_BASE_URL: 'https://developer.amd.com.cn/radeon/api/v1', AI_API_KEY: 'set', AI_MODEL: 'set', EVOLUS_TRACK: 'true',
    },
    repositoryVisibility: 'PUBLIC',
    evidence: { amdInference: 'VERIFIED', workingPrototypeUrl: 'VERIFIED', demoVideo: 'VERIFIED', pitchDeck: 'VERIFIED' },
  });
  assert.equal(report.evolus.status, 'BLOCKED');
  assert.match(report.evolus.missing.join(' '), /workspace telemetry/);
});

test('presence and valid-looking URLs require review and cannot produce READY', () => {
  const report = assessReadiness({
    env: {
      AI_MODE: 'remote', AI_PROVIDER: 'amd-token-factory',
      AI_BASE_URL: 'https://developer.amd.com.cn/radeon/api/v1', AI_API_KEY: 'secret', AI_MODEL: 'model',
    },
    repositoryVisibility: 'PUBLIC',
    evidence: { amdInference: 'PRESENT', workingPrototypeUrl: 'PRESENT', demoVideo: 'PRESENT', pitchDeck: 'PRESENT' },
  });
  assert.equal(report.amd.status, 'REVIEW_REQUIRED');
  assert.equal(report.assets.status, 'REVIEW_REQUIRED');
  assert.equal(report.overall, 'BLOCKED');
});

test('does not treat a generic remote provider as AMD configuration', () => {
  const report = assessReadiness({
    env: {
      AI_MODE: 'remote', AI_PROVIDER: 'openai-compatible',
      AI_BASE_URL: 'https://example.invalid/v1', AI_API_KEY: 'secret', AI_MODEL: 'model',
    },
    repositoryVisibility: 'PUBLIC',
    evidence: { amdInference: 'VERIFIED' },
  });

  assert.equal(report.amd.status, 'BLOCKED');
  assert.match(report.amd.missing.join(' '), /AI_PROVIDER=amd-token-factory/);
});
