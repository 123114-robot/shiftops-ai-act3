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
      'Recommend employee-liam for shift shift-1 because: ACTIVE, AVAILABLE, NO_OVERLAP, NO_APPROVED_LEAVE, WITHIN_WEEKLY_LIMIT.',
    );
  });

  it('uses a trusted renderer for a valid structured response', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        employeeId: 'employee-liam',
        reasonCodes: facts.reasons,
        style: 'concise',
      }) } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const remote = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1', apiKey: 'secret', model: 'open-model', timeoutMs: 500,
    }, fetcher);
    const provider = new GroundedExplanationProvider(remote, new DeterministicExplanationProvider());

    await expect(provider.explain(facts)).resolves.toBe(
      'Recommend employee-liam for shift shift-1: active employee; available for the full shift; no overlapping shift; no approved leave; within the weekly hours limit.',
    );
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://amd.example/v1/chat/completions');
  });

  it('rejects a mismatched candidate and falls back deterministically', async () => {
    const remote = { generate: async () => ({
      employeeId: 'employee-noah', style: 'concise' as const, reasonCodes: facts.reasons,
    }) };
    const provider = new GroundedExplanationProvider(remote, new DeterministicExplanationProvider());
    await expect(provider.explain(facts)).resolves.toContain('Recommend employee-liam');
  });

  it('rejects invented or omitted reason codes', async () => {
    const provider = new GroundedExplanationProvider({
      generate: async () => ({
        employeeId: facts.employeeId,
        style: 'concise' as const,
        reasonCodes: [...facts.reasons.slice(0, -1), 'INVENTED_QUALIFICATION'],
      }),
    }, new DeterministicExplanationProvider());
    await expect(provider.explain(facts)).resolves.toContain('Recommend employee-liam');
  });

  it('rejects duplicate reasons and extra free-text claims', async () => {
    const fallback = new DeterministicExplanationProvider();
    await expect(new GroundedExplanationProvider({ generate: async () => ({
      employeeId: facts.employeeId, style: 'concise' as const,
      reasonCodes: [...facts.reasons, facts.reasons[0]!],
    }) }, fallback).explain(facts)).resolves.toContain('because: ACTIVE');

    const fetcher = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
      employeeId: facts.employeeId, style: 'concise', reasonCodes: facts.reasons,
      explanation: 'Also legally qualified and always punctual.',
    }) } }] }), { status: 200 }));
    const remote = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1', apiKey: 'secret', model: 'open-model', timeoutMs: 500,
    }, fetcher);
    await expect(new GroundedExplanationProvider(remote, fallback).explain(facts)).resolves.toContain('because: ACTIVE');
  });

  it('falls back on provider errors, malformed output, and timeout', async () => {
    const fallback = new DeterministicExplanationProvider();
    await expect(new GroundedExplanationProvider({
      generate: async () => { throw new Error('provider unavailable'); },
    }, fallback).explain(facts)).resolves.toContain('Recommend employee-liam');

    const malformedFetch = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: 'not-json' } }],
    }), { status: 200 }));
    const malformed = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1/', apiKey: 'secret', model: 'open-model', timeoutMs: 500,
    }, malformedFetch);
    await expect(new GroundedExplanationProvider(malformed, fallback).explain(facts))
      .resolves.toContain('Recommend employee-liam');

    const timeoutFetch = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const timeout = new OpenAICompatibleExplanationProvider({
      baseUrl: 'https://amd.example/v1', apiKey: 'secret', model: 'open-model', timeoutMs: 1,
    }, timeoutFetch);
    await expect(new GroundedExplanationProvider(timeout, fallback).explain(facts))
      .resolves.toContain('Recommend employee-liam');
  });
});
