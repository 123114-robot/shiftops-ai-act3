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
    explanation: string;
    reasonCodes: string[];
  }>;
}

export type OpenAICompatibleConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
};

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export class DeterministicExplanationProvider implements ExplanationProvider {
  async explain(facts: ExplanationFacts) {
    return `Recommend ${facts.employeeId} for shift ${facts.shiftId} because: ${facts.reasons.join(', ')}.`;
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
  }

  async generate(facts: ExplanationFacts) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await this.fetcher(
        `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.config.model,
            temperature: 0,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'Explain only the supplied validated scheduling facts. Do not add qualifications, availability, legal conclusions, or other employees. Return JSON with employeeId, explanation, and reasonCodes. reasonCodes must exactly repeat the supplied reasons.',
              },
              { role: 'user', content: JSON.stringify(facts) },
            ],
          }),
          signal: controller.signal,
        },
      );
      if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}.`);
      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error('AI provider returned no explanation.');
      const parsed = JSON.parse(content) as {
        employeeId?: unknown;
        explanation?: unknown;
        reasonCodes?: unknown;
      };
      if (
        typeof parsed.employeeId !== 'string'
        || typeof parsed.explanation !== 'string'
        || !Array.isArray(parsed.reasonCodes)
        || !parsed.reasonCodes.every(reason => typeof reason === 'string')
      ) {
        throw new Error('AI provider returned an invalid explanation schema.');
      }
      return {
        employeeId: parsed.employeeId,
        explanation: parsed.explanation,
        reasonCodes: parsed.reasonCodes as string[],
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
  ) {}

  async explain(facts: ExplanationFacts) {
    try {
      const result = await this.remote.generate(facts);
      const explanation = result.explanation.trim();
      const expectedReasons = [...facts.reasons].sort();
      const returnedReasons = [...result.reasonCodes].sort();
      const reasonsMatch = expectedReasons.length === returnedReasons.length
        && expectedReasons.every((reason, index) => reason === returnedReasons[index]);
      if (
        result.employeeId !== facts.employeeId
        || !reasonsMatch
        || !explanation
        || explanation.length > 800
      ) {
        return this.fallback.explain(facts);
      }
      return explanation;
    } catch {
      return this.fallback.explain(facts);
    }
  }
}
