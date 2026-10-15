import { describe, expect, it, vi } from 'vitest';
import {
  DeterministicExplanationProvider,
  GroundedExplanationProvider,
  OpenAICompatibleExplanationProvider,
  type ExplanationFacts,
} from '../src/shiftops/ShiftOpsExplanationProvider.js';

const facts: ExplanationFacts = {
  shiftId: 'shift-1',
  employeeId: 'employee-liam',
  score: 1_440,
  reasons: ['ACTIVE', 'AVAILABLE', 'NO_OVERLAP', 'NO_APPROVED_LEAVE', 'WITHIN_WEEKLY_LIMIT'],
};

describe('ShiftOps explanation providers', () => {
  it('produces a deterministic explanation from validated facts', async () => {
    const provider = new DeterministicExplanationProvider();
    await expect(provider.explain(facts)).resolves.toBe(
      'Recommend employee-liam for shift shift-1 because: ACTIVE, AVAILABLE, NO_OVERLAP, NO_APPROVED_LEAVE, WITHIN_WEEKLY_LIMIT. [Source: deterministic]',
    );
  });

  it('labels successful mocked responses without presenting them as AMD evidence', async () => {
    const provider = new GroundedExplanationProvider({ generate: async () => ({
      employeeId: facts.employeeId,
      style: 'concise' as const,
      reasonCodes: facts.reasons,
      provenance: {
        source: 'mock' as const,
        configuredModel: 'mock-model',
        responseModel: 'mock-model',
        requestId: 'mock-request',
        latencyMs: 1,
      },
    }) }, new DeterministicExplanationProvider('deterministic-fallback'));

    await expect(provider.explain(facts)).resolves.toContain('[Source: mocked test response; model: mock-model]');
  });

  it('uses a trusted renderer for a valid structured response', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      id: 'chatcmpl-amd-1',
      model: 'open-model',
      choices: [{ message: { content: JSON.stringify({
        employeeId: 'employee-liam',
        reasonCodes: facts.reasons,
        style: 'concise',
      }) } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json', 'x-request-id': 'amd-request-1' } }));
    const remote = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://developer.amd.com.cn/radeon/api/v1', apiKey: 'secret', model: 'open-model', timeoutMs: 500,
      provider: 'amd-token-factory', supportsResponseFormat: false,
    }, fetcher);
    const observed = vi.fn();
    const provider = new GroundedExplanationProvider(
      remote,
      new DeterministicExplanationProvider('deterministic-fallback'),
      observed,
    );

    await expect(provider.explain(facts)).resolves.toBe(
      'Recommend employee-liam for shift shift-1: active employee; available for the full shift; no overlapping shift; no approved leave; within the weekly hours limit. [Source: AMD Token Factory; model: open-model]',
    );
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://developer.amd.com.cn/radeon/api/v1/chat/completions');
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body).not.toHaveProperty('response_format');
    expect(observed).toHaveBeenCalledWith(expect.objectContaining({
      source: 'amd-token-factory',
      configuredModel: 'open-model',
      responseModel: 'open-model',
      requestId: 'amd-request-1',
      outcome: 'remote',
    }));
  });

  it('rejects a mismatched candidate and falls back deterministically', async () => {
    const remote = { generate: async () => ({
      employeeId: 'employee-noah', style: 'concise' as const, reasonCodes: facts.reasons,
      provenance: { source: 'mock' as const, configuredModel: 'mock-model', responseModel: 'mock-model', latencyMs: 1 },
    }) };
    const provider = new GroundedExplanationProvider(remote, new DeterministicExplanationProvider('deterministic-fallback'));
    await expect(provider.explain(facts)).resolves.toContain('[Source: deterministic fallback]');
  });

  it('rejects invented or omitted reason codes', async () => {
    const provider = new GroundedExplanationProvider({
      generate: async () => ({
        employeeId: facts.employeeId,
        style: 'concise' as const,
        reasonCodes: [...facts.reasons.slice(0, -1), 'INVENTED_QUALIFICATION'],
        provenance: { source: 'mock' as const, configuredModel: 'mock-model', responseModel: 'mock-model', latencyMs: 1 },
      }),
    }, new DeterministicExplanationProvider('deterministic-fallback'));
    await expect(provider.explain(facts)).resolves.toContain('[Source: deterministic fallback]');
  });

  it('rejects duplicate reasons and extra free-text claims', async () => {
    const fallback = new DeterministicExplanationProvider('deterministic-fallback');
    await expect(new GroundedExplanationProvider({ generate: async () => ({
      employeeId: facts.employeeId, style: 'concise' as const,
      reasonCodes: [...facts.reasons, facts.reasons[0]!],
      provenance: { source: 'mock' as const, configuredModel: 'mock-model', responseModel: 'mock-model', latencyMs: 1 },
    }) }, fallback).explain(facts)).resolves.toContain('because: ACTIVE');

    const fetcher = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
      employeeId: facts.employeeId, style: 'concise', reasonCodes: facts.reasons,
      explanation: 'Also legally qualified and always punctual.',
    }) } }] }), { status: 200 }));
    const remote = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1', apiKey: 'secret', model: 'open-model', timeoutMs: 500,
      provider: 'mock', supportsResponseFormat: true,
    }, fetcher);
    await expect(new GroundedExplanationProvider(remote, fallback).explain(facts)).resolves.toContain('[Source: deterministic fallback]');
  });

  it('falls back on provider errors, malformed output, and timeout', async () => {
    const fallback = new DeterministicExplanationProvider('deterministic-fallback');
    await expect(new GroundedExplanationProvider({
      generate: async () => { throw new Error('provider unavailable'); },
    }, fallback).explain(facts)).resolves.toContain('Recommend employee-liam');

    const malformedFetch = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: 'not-json' } }],
    }), { status: 200 }));
    const malformed = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1/', apiKey: 'secret', model: 'open-model', timeoutMs: 500,
      provider: 'mock', supportsResponseFormat: true,
    }, malformedFetch);
    await expect(new GroundedExplanationProvider(malformed, fallback).explain(facts))
      .resolves.toContain('Recommend employee-liam');

    const timeoutFetch = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const timeout = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1', apiKey: 'secret', model: 'open-model', timeoutMs: 1,
      provider: 'mock', supportsResponseFormat: true,
    }, timeoutFetch);
    await expect(new GroundedExplanationProvider(timeout, fallback).explain(facts))
      .resolves.toContain('Recommend employee-liam');
  });

  it('rejects a response that reports a different model', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      id: 'chatcmpl-wrong-model',
      model: 'unexpected-model',
      choices: [{ message: { content: JSON.stringify({
        employeeId: facts.employeeId,
        reasonCodes: facts.reasons,
        style: 'concise',
      }) } }],
    }), { status: 200 }));
    const remote = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://developer.amd.com.cn/radeon/api/v1', apiKey: 'secret', model: 'expected-model', timeoutMs: 500,
      provider: 'amd-token-factory', supportsResponseFormat: false,
    }, fetcher);

    await expect(new GroundedExplanationProvider(
      remote,
      new DeterministicExplanationProvider('deterministic-fallback'),
    ).explain(facts)).resolves.toContain('[Source: deterministic fallback]');
  });
});
