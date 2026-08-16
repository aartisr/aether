import {
  createAssistantReply,
  type AssistantAction,
  type AssistantMessageInput,
  type AssistantReply,
  type AssistantSource,
} from '../assistant/conversation';
import { getPageIdForPath } from '../page-flags';
import { answerWithConfiguredRagProvider } from './answer-providers';
import { searchRagIndex } from './search';

export type FreeRagAssistantRequest = {
  message: string;
  contextPath?: string;
  history?: AssistantMessageInput[];
  enabledPageIds?: string[];
  includeKnowledgeBase?: boolean;
  maxResults?: number;
  minScore?: number;
};

const crisisPattern = /\b(suicide|kill myself|hurt myself|self harm|self-harm|immediate danger|emergency|crisis)\b/i;

export function createFreeRagAssistantReply(request: FreeRagAssistantRequest): AssistantReply {
  const baseReply = createAssistantReply(request);

  if (!request.message.trim() || crisisPattern.test(request.message)) {
    return baseReply;
  }

  // The guided responder owns questions it understands. This keeps simple,
  // high-stakes, or wayfinding questions from being replaced by keyword-matched
  // repository excerpts (for example, matching "start" in an engineering plan).
  if (baseReply.confidence === 'high') {
    return baseReply;
  }

  const results = searchRagIndex(request.message, {
    enabledPageIds: request.enabledPageIds,
    // Public conversations search only approved public pages by default.
    // Callers building an internal research experience can opt in explicitly.
    includeKnowledgeBase: request.includeKnowledgeBase ?? false,
    maxResults: request.maxResults ?? 6,
    minScore: request.minScore,
  });
  const ragAnswer = answerWithConfiguredRagProvider({
    question: request.message,
    contextPath: request.contextPath,
    results,
  });

  if (ragAnswer.confidence === 'low' && results.length === 0) {
    return {
      ...baseReply,
      answer: `${ragAnswer.answer}\n\nNavigation fallback: ${baseReply.answer}`,
      sources: filterReachableSources(dedupeSources([...baseReply.sources]), request.enabledPageIds),
      actions: filterReachableActions(baseReply.actions, request.enabledPageIds),
      suggestions: ragAnswer.suggestions,
      confidence: baseReply.confidence,
    };
  }

  const ragSources: AssistantSource[] = ragAnswer.citations.map((citation) => ({
    title: citation.title,
    href: citation.href,
    description: citation.description,
  }));
  const topSource = ragAnswer.citations[0];
  const sourceActions: AssistantAction[] = topSource
    ? [
        {
          label: 'Open top source',
          href: topSource.href,
          description: topSource.description,
          priority: 'primary',
        },
      ]
    : [];

  return {
    answer: ragAnswer.answer,
    sources: filterReachableSources(dedupeSources([...ragSources, ...baseReply.sources]), request.enabledPageIds).slice(0, 5),
    actions: filterReachableActions(dedupeActions([...sourceActions, ...baseReply.actions]), request.enabledPageIds).slice(0, 4),
    suggestions: ragAnswer.suggestions.length > 0 ? ragAnswer.suggestions : baseReply.suggestions,
    confidence: ragAnswer.confidence,
    contextLabel: baseReply.contextLabel,
  };
}

function filterReachableSources(sources: AssistantSource[], enabledPageIds: string[] = []) {
  return sources.filter((source) => isHrefAllowed(source.href, enabledPageIds));
}

function filterReachableActions(actions: AssistantAction[], enabledPageIds: string[] = []) {
  return actions.filter((action) => isHrefAllowed(action.href, enabledPageIds));
}

function isHrefAllowed(href: string, enabledPageIds: string[]) {
  if (href.startsWith('http://') || href.startsWith('https://') || href === '/ask') {
    return true;
  }

  const normalizedHref = href.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const pageId = getPageIdForPath(normalizedHref);
  return pageId ? enabledPageIds.includes(pageId) : true;
}

function dedupeSources(sources: AssistantSource[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.href)) {
      return false;
    }

    seen.add(source.href);
    return true;
  });
}

function dedupeActions(actions: AssistantAction[]) {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.href)) {
      return false;
    }

    seen.add(action.href);
    return true;
  });
}
