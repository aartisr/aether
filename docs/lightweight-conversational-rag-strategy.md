# Lightweight Conversational RAG Strategy

Status: implementation strategy  
Last updated: 2026-05-03  
Goal: add an extremely lightweight, Vercel-friendly conversational RAG assistant that can answer intelligent questions from Aether website content without adding a vector database or heavy backend service.

## Recommendation

Use static RAG:

```txt
Repo content
  -> build-time index script
  -> chunk documents
  -> generate embeddings
  -> write compact server-only JSON index
  -> deploy with Next.js
  -> /api/ai/chat loads index
  -> embed user question
  -> cosine search in memory
  -> answer with citations
```

This keeps the system part of the normal server deploy. No Postgres, Pinecone, Supabase, LangChain, queues, workers, or background indexing is required for MVP.

## Free-First Provider Model

The first implementation should not require an LLM key. It should use a free extractive provider:

```txt
RAG_ANSWER_PROVIDER=extractive-free
```

The provider reads top retrieved chunks, selects relevant excerpts, returns source cards, and recommends next steps. This is not as fluent as a hosted LLM, but it is free, deployable, and portable.

The runtime should keep a provider interface so later adapters can be added without changing the UI:

```txt
extractive-free  -> static BM25 retrieval + cited excerpts
hosted-llm       -> OpenAI, Anthropic, Gemini, or other hosted provider
ollama-local     -> self-hosted local model through Ollama
browser-webllm   -> client-side WebGPU model for capable browsers
```

Website-specific setup belongs in `rag.config.json`; the indexing and retrieval code should remain generic enough to move into another Next.js site.

## Why Static RAG Fits Aether

Aether's content corpus is small and structured:

- `Aether_Journal_Scientific_Report.md`
- `docs/*.md`
- blog markdown from `content/blog/*.md`
- page copy from `apps/frontend/src/lib/home-page.ts`
- page copy from `apps/frontend/src/lib/info-pages.ts`
- research references from `apps/frontend/src/lib/resilience-model.ts`
- mentor content from `apps/frontend/src/lib/mentor-recognition.ts`
- metadata from `apps/frontend/src/lib/site.ts`
- machine-readable hints from `llms.txt`, sitemap, RSS, and page metadata

For hundreds or a few thousand chunks, in-memory cosine similarity is simple, fast, and more than enough. The app only needs an external call for:

1. embedding the user's question at runtime;
2. generating the final answer.

## Target Architecture

### 1. Build-Time Indexer

Add:

```txt
apps/frontend/scripts/build-rag-index.mjs
```

Responsibilities:

- read approved source files;
- strip Markdown/HTML noise;
- extract title, headings, canonical path, page ID, visibility, and content hash;
- split content by heading-aware chunks;
- generate embeddings;
- write a compact JSON index into a server-only generated location.

Suggested output:

```txt
apps/frontend/src/generated/rag-index.json
```

or:

```txt
apps/frontend/.generated/rag-index.json
```

Each chunk should look like:

```ts
{
  id: "docs-peer-matching-algorithm-03",
  title: "Peer Matching Algorithm",
  sourcePath: "docs/peer-matching-algorithm.md",
  url: "/docs/peer-matching-algorithm",
  pageId: "peer-navigator",
  visibility: "knowledge-base",
  heading: "Phase 1 Candidate Generation",
  text: "Clean chunk text...",
  embedding: [0.012, -0.003],
  tokens: 420,
  contentHash: "sha256..."
}
```

### 2. Server Chat Route

Add:

```txt
apps/frontend/src/app/api/ai/chat/route.ts
```

Responsibilities:

- accept chat messages;
- take the latest user question;
- embed that question server-side;
- search the local JSON index;
- select top chunks;
- generate an answer using only retrieved sources;
- return citations with the answer;
- optionally stream the response.

No OpenAI key should ever be exposed to the browser.

### 3. Retrieval Layer

Add:

```txt
apps/frontend/src/lib/rag/search.ts
apps/frontend/src/lib/rag/prompt.ts
apps/frontend/src/lib/rag/sources.ts
apps/frontend/src/lib/rag/types.ts
```

Retrieval should stay intentionally small:

- cosine similarity;
- optional keyword boost;
- source deduping;
- minimum similarity threshold;
- page-toggle filtering;
- weak-answer fallback.

### 4. Lightweight UI

Add one of:

```txt
apps/frontend/src/app/ask/page.tsx
```

or a small site-wide "Ask Aether" widget after the route is stable.

UI requirements:

- question input;
- streamed or simple answer output;
- source cards under every answer;
- clear "informational, not emergency or clinical care" notice;
- useful empty state when the assistant cannot answer from indexed content.

## Indexing Policy

### Include

Index these source-of-truth surfaces:

- `Aether_Journal_Scientific_Report.md`
- `docs/*.md`
- `content/blog/*.md`
- `apps/frontend/src/lib/home-page.ts`
- `apps/frontend/src/lib/info-pages.ts`
- `apps/frontend/src/lib/resilience-model.ts`
- `apps/frontend/src/lib/mentor-recognition.ts`
- `apps/frontend/src/lib/site.ts`

### Exclude

Never index:

- `.env*`
- admin secrets
- credentials
- private notes
- test files
- generated build files
- `.next`
- `node_modules`
- binary images
- raw source code unless it is a curated content module

## Chunking Strategy

Use heading-aware chunking:

1. Split Markdown by headings.
2. Keep heading context attached to each chunk.
3. Split long sections into smaller chunks.
4. Keep chunks around 300-700 tokens.
5. Preserve source title, heading, and canonical URL.
6. Avoid orphan chunks with no context.

Good chunk metadata matters as much as embeddings. The assistant should cite titles and source paths, not invisible IDs.

## Runtime Retrieval Strategy

At runtime:

```txt
User query
  -> query embedding
  -> cosine search local JSON vectors
  -> optional keyword boost
  -> filter by visibility and enabled pages
  -> dedupe by source
  -> select top 4-8 chunks
  -> answer with citations
```

If retrieval confidence is weak, answer:

```txt
I could not find enough information in the current Aether content to answer that confidently.
```

Then suggest relevant pages or ask a clarifying question.

## Page Toggle Awareness

Aether has admin-controlled page visibility. RAG should respect it.

Recommended chunk visibility:

```ts
type RagVisibility = "public" | "knowledge-base" | "admin";
```

Rules:

- `public`: answer only when the related page is enabled.
- `knowledge-base`: allowed for general assistant knowledge even if it is not a public nav page.
- `admin`: reserved for future admin-only RAG.

Each chunk can also include:

```ts
pageId?: AppPageId;
```

At query time:

- public user mode filters disabled public pages;
- admin mode can optionally search everything later;
- source citations should never link to disabled routes unless the user has access.

## Answering Rules

The assistant should follow a strict system prompt:

```txt
You are Aether's website assistant.
Answer using only the retrieved Aether sources.
Cite sources by title and path.
If the sources do not answer the question, say so.
Do not provide clinical, legal, or emergency advice.
For urgent safety language, direct users to emergency services or 988 in the United States.
Do not reveal hidden, admin-only, secret, or environment configuration content.
```

Answer format:

```txt
Short answer.

Details grounded in retrieved content.

Sources:
- Source title, path or URL
- Source title, path or URL
```

## Safety Strategy

Because Aether is wellbeing-adjacent:

- do not position the assistant as therapy;
- do not answer emergency situations as a chatbot;
- show 988 guidance for U.S. crisis language;
- use the same scope boundaries as Peer-Navigator Network;
- avoid making claims not present in retrieved content;
- cite sources for product, policy, and research statements;
- log only minimal telemetry.

Suggested crisis response:

```txt
I am not emergency support. If you or someone else may be in immediate danger, contact local emergency services now. In the United States, call or text 988 for the Suicide and Crisis Lifeline.
```

## Environment Variables

Minimum:

```txt
OPENAI_API_KEY=
```

Optional:

```txt
RAG_ENABLED=true
RAG_MODEL=
RAG_EMBEDDING_MODEL=
RAG_MAX_CONTEXT_CHUNKS=6
RAG_MIN_SIMILARITY=0.72
RAG_INDEX_PATH=
```

Build should be resilient:

- if `OPENAI_API_KEY` is present, generate embeddings;
- if not present and an index already exists, use it;
- if not present and no index exists, generate a lexical-only fallback or disable `/ask` gracefully.

## Package Strategy

Keep dependencies minimal.

Recommended:

- OpenAI SDK only, or Vercel AI SDK if streaming UI is desired.

Avoid for MVP:

- LangChain;
- database ORM;
- vector database SDK;
- queue libraries;
- background worker frameworks.

## Vercel Build Strategy

Use a build script:

```json
{
  "scripts": {
    "build:rag": "node apps/frontend/scripts/build-rag-index.mjs",
    "build": "npm run build:rag && npm --workspace=apps/frontend run build"
  }
}
```

Safer alternative:

```json
{
  "scripts": {
    "build:rag": "node apps/frontend/scripts/build-rag-index.mjs || echo \"RAG index skipped\"",
    "build": "npm run build:rag && npm --workspace=apps/frontend run build"
  }
}
```

Do not fail deploys if the RAG index is optional. Once production RAG is required, make the build stricter.

## MVP Implementation Plan

### Phase 1: Static Knowledge Index

Steps:

1. Add RAG source definitions.
2. Add Markdown/content extraction.
3. Add heading-aware chunker.
4. Add content hash.
5. Add embedding generation.
6. Write generated JSON index.
7. Add tests for chunking and source inclusion/exclusion.

Acceptance criteria:

- docs and blog content become chunks;
- secrets and env files are excluded;
- index can be loaded server-side;
- repeat builds produce stable chunk IDs.

### Phase 2: Local Retrieval

Steps:

1. Add cosine similarity.
2. Add keyword boost.
3. Add dedupe by source.
4. Add page visibility filtering.
5. Add weak-confidence fallback.

Acceptance criteria:

- a query about Peer-Navigator finds Peer-Navigator docs;
- a query about privacy finds privacy-related chunks;
- disabled public pages are excluded for public users;
- low-confidence queries do not hallucinate.

### Phase 3: Chat API

Steps:

1. Add `/api/ai/chat`.
2. Validate request body.
3. Embed latest question.
4. Retrieve top chunks.
5. Compose system prompt and context.
6. Generate answer.
7. Return citations.

Acceptance criteria:

- endpoint answers from indexed content;
- answer contains sources;
- no browser-exposed API key;
- crisis language uses safety response.

### Phase 4: UI

Steps:

1. Add `/ask`.
2. Add chat input and response view.
3. Add source cards.
4. Add safety note.
5. Add loading and empty states.

Acceptance criteria:

- user can ask questions;
- answer cites sources;
- weak answer state is clear;
- UI works on mobile and desktop.

### Phase 5: Quality And Governance

Steps:

1. Add evaluation questions.
2. Add retrieval debug mode in development.
3. Add admin-only source coverage report.
4. Add stale index warning.
5. Add reindex command.

Acceptance criteria:

- core questions produce grounded answers;
- stale/missing index is visible;
- content coverage can be inspected.

## Suggested File Tree

```txt
apps/frontend/
  scripts/
    build-rag-index.mjs
  src/
    app/
      api/
        ai/
          chat/
            route.ts
      ask/
        page.tsx
    generated/
      rag-index.json
    lib/
      rag/
        chunk.ts
        prompt.ts
        search.ts
        sources.ts
        types.ts
```

## Testing Plan

Unit tests:

- chunker preserves headings;
- source filters exclude `.env*`;
- cosine search ranks obvious matches first;
- disabled pages are filtered;
- weak retrieval returns fallback;
- prompt includes citations and safety instructions.

Integration tests:

- `/api/ai/chat` answers a known question from docs;
- citations include title and URL/path;
- urgent safety wording triggers crisis boundary.

Build tests:

- `npm run build:rag`;
- `npm --workspace=apps/frontend run typecheck`;
- `npm --workspace=apps/frontend run lint`;
- `npm --workspace=apps/frontend run test`;
- `npm --workspace=apps/frontend run build`.

## Final Recommendation

Start with:

```txt
Next.js API route
+ build-time JSON vector index
+ server-side query embedding
+ local cosine search
+ grounded answer generation
+ citations
```

This gives Aether a serious conversational RAG assistant while staying lightweight, easy to deploy on Vercel, and maintainable inside the existing repo.
