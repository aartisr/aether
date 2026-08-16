import { citationsFromResults, getRagIndexMetadata } from './search';
import type { RagAnswer, RagAnswerProvider, RagAnswerRequest, RagProviderId } from './types';

export const ragProviderCatalog: Record<RagProviderId, { label: string; cost: 'free' | 'external'; status: string }> = {
  'extractive-free': {
    label: 'Free extractive RAG',
    cost: 'free',
    status: 'active',
  },
  'hosted-llm': {
    label: 'Hosted LLM adapter',
    cost: 'external',
    status: 'placeholder',
  },
  'ollama-local': {
    label: 'Ollama local adapter',
    cost: 'free',
    status: 'placeholder',
  },
  'browser-webllm': {
    label: 'Browser WebLLM adapter',
    cost: 'free',
    status: 'placeholder',
  },
};

const extractiveFreeProvider: RagAnswerProvider = {
  id: 'extractive-free',
  label: ragProviderCatalog['extractive-free'].label,
  cost: 'free',
  answer(request) {
    const citations = citationsFromResults(request.results).slice(0, 5);
    const metadata = getRagIndexMetadata();

    if (request.results.length === 0) {
      return {
        answer: `I do not have an approved ${metadata.siteName} source that answers that directly yet. I would rather be clear than guess. If you share what you are trying to decide, I can help you choose a relevant Aether path.`,
        citations: [],
        provider: 'extractive-free',
        confidence: 'low',
        suggestions: ['Where should I start?', 'What pages can I use?', 'How does Aether help students?'],
      };
    }

    const topScore = request.results[0]?.score ?? 0;
    const confidence = topScore >= 8 ? 'high' : topScore >= 2.4 ? 'medium' : 'low';
    const evidenceLines = request.results.slice(0, 3).map((result) => {
      const label = result.chunk.heading || result.chunk.title;
      return `• ${result.excerpt}\n  Source: ${label}`;
    });

    return {
      answer: [
        `Here is the most relevant approved ${metadata.siteName} information I found:`,
        '',
        ...evidenceLines,
        '',
        'Open the source below for the full context, or ask me to explain it in simpler words.',
      ].join('\n'),
      citations,
      provider: 'extractive-free',
      confidence,
      suggestions: buildSuggestions(request),
    };
  },
};

export function getRagAnswerProvider(providerId?: string): RagAnswerProvider {
  const requestedProvider = (providerId ?? process.env.RAG_ANSWER_PROVIDER ?? 'extractive-free') as RagProviderId;

  if (requestedProvider === 'extractive-free') {
    return extractiveFreeProvider;
  }

  return extractiveFreeProvider;
}

export function answerWithConfiguredRagProvider(request: RagAnswerRequest): RagAnswer {
  return getRagAnswerProvider().answer(request);
}

function buildSuggestions(request: RagAnswerRequest) {
  const topTitle = request.results[0]?.chunk.title;
  const suggestions = [
    topTitle ? `Summarize ${topTitle}` : undefined,
    'Which page should I open next?',
    'What should I do next?',
    'Explain this in simple words',
  ];

  return suggestions.filter((suggestion): suggestion is string => Boolean(suggestion)).slice(0, 3);
}
