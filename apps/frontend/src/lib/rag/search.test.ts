import { answerWithConfiguredRagProvider } from './answer-providers';
import { createFreeRagAssistantReply } from './assistant';
import { getRagIndexMetadata, searchRagIndex } from './search';

describe('free RAG search', () => {
  it('builds a reusable static index', () => {
    const metadata = getRagIndexMetadata();

    expect(metadata.siteName).toBe('Aether');
    expect(metadata.retrievalType).toBe('free-bm25');
    expect(metadata.chunkCount).toBeGreaterThan(10);
  });

  it('retrieves knowledge-base documents even when feature pages are off', () => {
    const results = searchRagIndex('How does peer matching fairness work?', {
      enabledPageIds: ['home', 'about', 'mentors'],
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.map((result) => result.chunk.title).join(' ')).toMatch(/Peer|Matching|Fairness/i);
  });

  it('filters disabled public pages when knowledge-base search is off', () => {
    const results = searchRagIndex('90 day resilience plan study stress support map', {
      enabledPageIds: ['home', 'about', 'mentors'],
      includeKnowledgeBase: false,
    });

    expect(results.some((result) => result.chunk.pageId === 'blog')).toBe(false);
  });

  it('keeps new registered pages controllable through enabled page ids', () => {
    const reply = createFreeRagAssistantReply({
      message: 'How do I submit feedback?',
      enabledPageIds: ['home', 'about', 'mentors'],
      includeKnowledgeBase: false,
      maxResults: 8,
    });

    expect(reply.sources.every((source) => source.href !== '/feedback')).toBe(true);
  });

  it('keeps a clear support question out of raw repository retrieval', () => {
    const reply = createFreeRagAssistantReply({
      message: 'Where should I start?',
      contextPath: '/ask',
      enabledPageIds: ['home', 'resilience-pathway', 'echo', 'peer-navigator', 'about'],
    });

    expect(reply.answer).toContain('Start small');
    expect(reply.answer).not.toContain('Context note');
    expect(reply.answer).not.toContain('indexed Aether content');
    expect(reply.answer).not.toContain('Recruitment Funnel');
    expect(reply.actions[0]?.href).toBe('/resilience-pathway');
  });

  it('does not search knowledge-base content for a public assistant request by default', () => {
    const reply = createFreeRagAssistantReply({
      message: 'Tell me something not covered by a named Aether pathway',
      enabledPageIds: ['home', 'about', 'mentors'],
    });

    expect(reply.sources.every((source) => !source.href.includes('/docs/'))).toBe(true);
  });

  it('creates a free extractive answer from search results', () => {
    const results = searchRagIndex('What is Aether?', {
      enabledPageIds: ['home', 'about', 'mentors'],
    });
    const answer = answerWithConfiguredRagProvider({
      question: 'What is Aether?',
      contextPath: '/',
      results,
    });

    expect(answer.provider).toBe('extractive-free');
    expect(answer.answer).toContain('relevant approved Aether information');
    expect(answer.citations.length).toBeGreaterThan(0);
  });
});
