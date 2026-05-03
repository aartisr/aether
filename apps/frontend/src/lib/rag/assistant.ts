import {
  createAssistantReply,
  type AssistantAction,
  type AssistantMessageInput,
  type AssistantReply,
  type AssistantSource,
} from '../assistant/conversation';
import { answerWithConfiguredRagProvider } from './answer-providers';
import { searchRagIndex } from './search';

export type FreeRagAssistantRequest = {
  message: string;
  contextPath?: string;
  history?: AssistantMessageInput[];
  enabledPageIds?: string[];
};

const crisisPattern = /\b(suicide|kill myself|hurt myself|self harm|self-harm|immediate danger|emergency|crisis)\b/i;
const pageIdByHref: Record<string, string> = {
  '/': 'home',
  '/about': 'about',
  '/mentors': 'mentors',
  '/resilience-pathway': 'resilience-pathway',
  '/echo': 'echo',
  '/peer-navigator': 'peer-navigator',
  '/blog': 'blog',
  '/fairness-governance': 'fairness-governance',
  '/privacy': 'privacy',
  '/accessibility': 'accessibility',
};

export function createFreeRagAssistantReply(request: FreeRagAssistantRequest): AssistantReply {
  const baseReply = createAssistantReply(request);

  if (!request.message.trim() || crisisPattern.test(request.message)) {
    return baseReply;
  }

  const results = searchRagIndex(request.message, {
    enabledPageIds: request.enabledPageIds,
    includeKnowledgeBase: true,
    maxResults: 6,
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
      confidence: baseReply.confidence === 'high' ? 'medium' : baseReply.confidence,
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
  const pageId = pageIdByHref[normalizedHref];
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
