import { NextResponse } from 'next/server';
import type { AssistantMessageInput } from '../../../../lib/assistant/conversation';
import { getEnabledPagesForRequest } from '../../../../lib/page-flags';
import { createFreeRagAssistantReply } from '../../../../lib/rag/assistant';

type ChatRequestBody = {
  message?: unknown;
  contextPath?: unknown;
  history?: unknown;
  maxResults?: unknown;
  minScore?: unknown;
};

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const history = Array.isArray(body.history)
    ? body.history.filter(isAssistantMessageInput).slice(-8)
    : [];

  const enabledPageIds = getEnabledPagesForRequest().map((page) => page.id);
  const maxResults =
    typeof body.maxResults === 'number' && Number.isFinite(body.maxResults)
      ? Math.min(Math.max(Math.round(body.maxResults), 1), 10)
      : undefined;
  const minScore =
    typeof body.minScore === 'number' && Number.isFinite(body.minScore)
      ? Math.min(Math.max(body.minScore, 0), 10)
      : undefined;
  const reply = createFreeRagAssistantReply({
    message: body.message,
    contextPath: typeof body.contextPath === 'string' ? body.contextPath : '/',
    history,
    enabledPageIds,
    // This is a public endpoint. Repository knowledge-base material is for an
    // internal research surface, not for a visitor-facing support conversation.
    includeKnowledgeBase: false,
    maxResults,
    minScore,
  });

  return NextResponse.json(reply, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function isAssistantMessageInput(value: unknown): value is AssistantMessageInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AssistantMessageInput>;
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.content === 'string'
  );
}
