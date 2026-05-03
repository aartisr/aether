import { NextResponse } from 'next/server';
import type { AssistantMessageInput } from '../../../../lib/assistant/conversation';
import { getEnabledPagesForRequest } from '../../../../lib/page-flags';
import { createFreeRagAssistantReply } from '../../../../lib/rag/assistant';

type ChatRequestBody = {
  message?: unknown;
  contextPath?: unknown;
  history?: unknown;
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
  const reply = createFreeRagAssistantReply({
    message: body.message,
    contextPath: typeof body.contextPath === 'string' ? body.contextPath : '/',
    history,
    enabledPageIds,
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
