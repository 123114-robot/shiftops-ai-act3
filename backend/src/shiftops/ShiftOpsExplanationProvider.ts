export type ExplanationFacts = {
  shiftId: string;
  employeeId: string;
  score: number;
  reasons: string[];
};

export interface ExplanationProvider {
  explain(facts: ExplanationFacts): Promise<string>;
}

export interface RawExplanationProvider {
  generate(facts: ExplanationFacts): Promise<{
    employeeId: string;
    reasonCodes: string[];
    style: 'concise' | 'detailed';
    provenance: RemoteExplanationProvenance;
  }>;
}

export type ExplanationSource = 'amd-token-factory' | 'openai-compatible' | 'mock';
export type DeterministicSource = 'deterministic' | 'deterministic-fallback';

export type RemoteExplanationProvenance = {
  source: ExplanationSource;
  configuredModel: string;
  responseModel: string;
  requestId?: string;
  latencyMs: number;
};

export type ExplanationTrace = RemoteExplanationProvenance & {
  outcome: 'remote';
};

export type OpenAICompatibleConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  provider: ExplanationSource;
  supportsResponseFormat: boolean;
};

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export const AMD_TOKEN_FACTORY_BASE_URL = 'https://developer.amd.com.cn/radeon/api/v1';

export class DeterministicExplanationProvider implements ExplanationProvider {
  constructor(private readonly source: DeterministicSource = 'deterministic') {}

  async explain(facts: ExplanationFacts) {
    const label = this.source === 'deterministic-fallback' ? 'deterministic fallback' : 'deterministic';
    return `Recommend ${facts.employeeId} for shift ${facts.shiftId} because: ${facts.reasons.join(', ')}. [Source: ${label}]`;
  }
}

export class OpenAICompatibleExplanationProvider implements RawExplanationProvider {
  constructor(
    private readonly config: OpenAICompatibleConfig,
    private readonly fetcher: Fetcher = fetch,
  ) {
    if (!config.baseUrl || !config.apiKey || !config.model) {
      throw new Error('AI_BASE_URL, AI_API_KEY, and AI_MODEL are required for remote AI mode.');
    }
    if (!Number.isInteger(config.timeoutMs) || config.timeoutMs <= 0) {
      throw new Error('AI timeout must be a positive integer.');
    }
    if (
      config.provider === 'amd-token-factory'
      && config.baseUrl.replace(/\/$/, '') !== AMD_TOKEN_FACTORY_BASE_URL
    ) {
      throw new Error(`AMD Token Factory base URL must be ${AMD_TOKEN_FACTORY_BASE_URL}.`);
    }
  }

  async generate(facts: ExplanationFacts) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const startedAt = performance.now();
    try {
      const requestBody: Record<string, unknown> = {
        model: this.config.model,
        temperature: 0,
        max_tokens: 1024,
        stream: false,
        messages: [
          {
            role: 'system',
            content: 'Return JSON only with employeeId, reasonCodes, and style. reasonCodes must exactly repeat the supplied reasons. style must be concise or detailed. Do not return explanation text or any other field.',
          },
          { role: 'user', content: JSON.stringify(facts) },
        ],
      };
      if (this.config.supportsResponseFormat) {
        requestBody.response_format = { type: 'json_object' };
      }
      const response = await this.fetcher(
        `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        },
      );
      if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}.`);
      const payload = await response.json() as {
        id?: unknown;
        model?: unknown;
        choices?: Array<{ message?: { content?: string } }>;
      };
      if (
        typeof payload.model !== 'string'
        || (
          payload.model !== this.config.model
          && !(
            this.config.provider === 'amd-token-factory'
            && this.config.model === 'MiniCPM5-2B'
            && payload.model === 'self-dploy/MiniCPM5-2B'
          )
        )
      ) {
        throw new Error('AI provider response model did not match the configured model.');
      }
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error('AI provider returned no explanation.');
      if (content.length > 4_000) throw new Error('AI provider returned oversized structured output.');
      const parsed = JSON.parse(content) as {
        employeeId?: unknown;
        reasonCodes?: unknown;
        style?: unknown;
      };
      if (
        Object.keys(parsed).sort().join(',') !== 'employeeId,reasonCodes,style'
        || typeof parsed.employeeId !== 'string'
        || !Array.isArray(parsed.reasonCodes)
        || !parsed.reasonCodes.every(reason => typeof reason === 'string')
        || !['concise', 'detailed'].includes(String(parsed.style))
      ) {
        throw new Error('AI provider returned an invalid explanation schema.');
      }
      return {
        employeeId: parsed.employeeId,
        reasonCodes: parsed.reasonCodes as string[],
        style: parsed.style as 'concise' | 'detailed',
        provenance: {
          source: this.config.provider,
          configuredModel: this.config.model,
          responseModel: payload.model,
          requestId: safeRequestId(response.headers.get('x-request-id'))
            ?? safeRequestId(typeof payload.id === 'string' ? payload.id : undefined),
          latencyMs: Math.round(performance.now() - startedAt),
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

export class GroundedExplanationProvider implements ExplanationProvider {
  constructor(
    private readonly remote: RawExplanationProvider,
    private readonly fallback: ExplanationProvider,
    private readonly observe?: (trace: ExplanationTrace) => void,
  ) {}

  async explain(facts: ExplanationFacts) {
    try {
      const result = await this.remote.generate(facts);
      const expectedReasons = [...facts.reasons].sort();
      const returnedReasons = [...result.reasonCodes].sort();
      const reasonsMatch = expectedReasons.length === returnedReasons.length
        && expectedReasons.every((reason, index) => reason === returnedReasons[index]);
      if (
        result.employeeId !== facts.employeeId
        || !reasonsMatch
        || new Set(result.reasonCodes).size !== result.reasonCodes.length
      ) {
        return this.fallback.explain(facts);
      }
      const labels: Record<string, string> = {
        ACTIVE: 'active employee', AVAILABLE: 'available for the full shift',
        NO_OVERLAP: 'no overlapping shift', NO_APPROVED_LEAVE: 'no approved leave',
        WITHIN_WEEKLY_LIMIT: 'within the weekly hours limit', ROLE_MATCH: 'required role matches',
      };
      const rendered = result.reasonCodes.map(code => labels[code]);
      if (rendered.some(label => !label)) return this.fallback.explain(facts);
      const separator = result.style === 'detailed' ? '. ' : '; ';
      const source = {
        'amd-token-factory': 'AMD Token Factory',
        'openai-compatible': 'remote OpenAI-compatible provider',
        mock: 'mocked test response',
      }[result.provenance.source];
      this.observe?.({ ...result.provenance, outcome: 'remote' });
      return `Recommend ${facts.employeeId} for shift ${facts.shiftId}: ${rendered.join(separator)}. [Source: ${source}; model: ${result.provenance.responseModel}]`;
    } catch {
      return this.fallback.explain(facts);
    }
  }
}

function safeRequestId(value: string | null | undefined) {
  if (!value || value.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(value)) return undefined;
  return value;
}
