import ragIndexJson from '../../generated/rag-index.json';
import { countTerms, normalizeForPhraseSearch, tokenizeForRag } from './tokenize';
import type { RagChunk, RagIndex, RagSearchOptions, RagSearchResult } from './types';

const ragIndex = ragIndexJson as unknown as RagIndex;

const DEFAULT_MAX_RESULTS = 6;
const DEFAULT_MIN_SCORE = 0.35;
const BM25_K1 = 1.25;
const BM25_B = 0.72;

export function getRagIndexMetadata() {
  return {
    siteName: ragIndex.siteName,
    chunkCount: ragIndex.chunks.length,
    retrievalType: ragIndex.retrieval.type,
  };
}

export function searchRagIndex(query: string, options: RagSearchOptions = {}): RagSearchResult[] {
  const queryTerms = tokenizeForRag(query);
  const queryTermCounts = countTerms(queryTerms);
  const uniqueQueryTerms = Object.keys(queryTermCounts);

  if (uniqueQueryTerms.length === 0) {
    return [];
  }

  const normalizedQueryPhrase = normalizeForPhraseSearch(query);
  const enabledPageIds = new Set(options.enabledPageIds ?? []);
  const includeKnowledgeBase = options.includeKnowledgeBase ?? true;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;

  return ragIndex.chunks
    .filter((chunk) => isChunkSearchable(chunk, { enabledPageIds, includeKnowledgeBase, includeAdmin: options.includeAdmin }))
    .flatMap((chunk) => {
      const result = scoreChunk(chunk, uniqueQueryTerms, queryTermCounts, normalizedQueryPhrase);
      return result && result.score >= minScore ? [result] : [];
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, options.maxResults ?? DEFAULT_MAX_RESULTS);
}

export function citationsFromResults(results: RagSearchResult[]) {
  const seen = new Set<string>();

  return results
    .filter((result) => {
      const key = `${result.chunk.url}:${result.chunk.heading}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((result) => ({
      title: result.chunk.title,
      href: result.chunk.url,
      description: result.chunk.heading
        ? `${result.chunk.heading} in ${result.chunk.sourcePath}`
        : result.chunk.sourcePath,
      sourcePath: result.chunk.sourcePath,
      heading: result.chunk.heading,
    }));
}

function isChunkSearchable(
  chunk: RagChunk,
  options: {
    enabledPageIds: Set<string>;
    includeKnowledgeBase: boolean;
    includeAdmin?: boolean;
  },
) {
  if (chunk.visibility === 'admin') {
    return options.includeAdmin === true;
  }

  if (chunk.visibility === 'knowledge-base') {
    return options.includeKnowledgeBase;
  }

  if (!chunk.pageId || options.enabledPageIds.size === 0) {
    return true;
  }

  return options.enabledPageIds.has(chunk.pageId);
}

function scoreChunk(
  chunk: RagChunk,
  uniqueQueryTerms: string[],
  queryTermCounts: Record<string, number>,
  normalizedQueryPhrase: string,
): RagSearchResult | undefined {
  const matchedTerms: string[] = [];
  let score = 0;

  for (const term of uniqueQueryTerms) {
    const termFrequency = chunk.terms[term] ?? 0;
    if (termFrequency === 0) {
      continue;
    }

    matchedTerms.push(term);
    score += bm25(term, termFrequency, chunk.termCount) * Math.min(queryTermCounts[term] ?? 1, 3);
  }

  if (matchedTerms.length === 0) {
    return undefined;
  }

  const titleAndHeading = normalizeForPhraseSearch(`${chunk.title} ${chunk.heading}`);
  const normalizedChunkText = normalizeForPhraseSearch(chunk.text);
  const titleMatches = matchedTerms.filter((term) => titleAndHeading.includes(term)).length;
  score += titleMatches * 0.55;

  if (normalizedQueryPhrase.length > 10 && normalizedChunkText.includes(normalizedQueryPhrase)) {
    score += 1.25;
  }

  const coverage = matchedTerms.length / uniqueQueryTerms.length;
  score *= 0.7 + coverage * 0.3;

  return {
    chunk,
    score: Number(score.toFixed(4)),
    matchedTerms,
    excerpt: selectExcerpt(chunk.text, matchedTerms),
  };
}

function bm25(term: string, termFrequency: number, documentLength: number) {
  const idf = ragIndex.stats.idf[term] ?? 0;
  const averageLength = ragIndex.stats.averageTermCount || 1;
  const numerator = termFrequency * (BM25_K1 + 1);
  const denominator = termFrequency + BM25_K1 * (1 - BM25_B + BM25_B * (documentLength / averageLength));

  return idf * (numerator / denominator);
}

function selectExcerpt(text: string, matchedTerms: string[]) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const scored = sentences
    .map((sentence) => ({
      sentence,
      score: tokenizeForRag(sentence).filter((term) => matchedTerms.includes(term)).length,
    }))
    .sort((left, right) => right.score - left.score);

  const best = scored.find((item) => item.score > 0)?.sentence ?? sentences[0] ?? text;
  return truncate(best, 320);
}

function truncate(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength).replace(/\s+\S*$/, '')}...`;
}
