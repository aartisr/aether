export type RagVisibility = 'public' | 'knowledge-base' | 'admin';

export type RagProviderId = 'extractive-free' | 'hosted-llm' | 'ollama-local' | 'browser-webllm';

export type RagChunk = {
  id: string;
  title: string;
  sourceId: string;
  sourcePath: string;
  localPath: string;
  url: string;
  pageId?: string;
  visibility: RagVisibility;
  heading: string;
  text: string;
  terms: Record<string, number>;
  termCount: number;
  contentHash: string;
};

export type RagIndex = {
  schemaVersion: number;
  siteName: string;
  retrieval: {
    type: string;
    description: string;
  };
  stats: {
    documentCount: number;
    averageTermCount: number;
    idf: Record<string, number>;
  };
  chunks: RagChunk[];
};

export type RagSearchOptions = {
  maxResults?: number;
  minScore?: number;
  includeKnowledgeBase?: boolean;
  includeAdmin?: boolean;
  enabledPageIds?: string[];
};

export type RagSearchResult = {
  chunk: RagChunk;
  score: number;
  matchedTerms: string[];
  excerpt: string;
};

export type RagCitation = {
  title: string;
  href: string;
  description: string;
  sourcePath: string;
  heading: string;
};

export type RagAnswerRequest = {
  question: string;
  contextPath?: string;
  results: RagSearchResult[];
};

export type RagAnswer = {
  answer: string;
  citations: RagCitation[];
  provider: RagProviderId;
  confidence: 'high' | 'medium' | 'low';
  suggestions: string[];
};

export type RagAnswerProvider = {
  id: RagProviderId;
  label: string;
  cost: 'free' | 'external';
  answer: (request: RagAnswerRequest) => RagAnswer;
};
