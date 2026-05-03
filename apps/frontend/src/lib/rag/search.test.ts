import { answerWithConfiguredRagProvider } from './answer-providers';
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
    expect(answer.answer).toContain('indexed Aether content');
    expect(answer.citations.length).toBeGreaterThan(0);
  });
});
