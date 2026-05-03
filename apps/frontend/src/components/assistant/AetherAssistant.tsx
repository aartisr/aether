'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getAssistantContextProfile,
  getAssistantWelcome,
  type AssistantAction,
  type AssistantMessageInput,
  type AssistantReply,
  type AssistantSource,
} from '../../lib/assistant/conversation';

type AssistantUiMessage = AssistantMessageInput & {
  id: string;
  sources?: AssistantSource[];
  actions?: AssistantAction[];
  suggestions?: string[];
  confidence?: AssistantReply['confidence'];
};

type AetherAssistantProps = {
  variant?: 'floating' | 'page';
  enabledPaths?: string[];
};

const pageControlledPaths = [
  '/',
  '/about',
  '/mentors',
  '/resilience-pathway',
  '/echo',
  '/peer-navigator',
  '/blog',
  '/fairness-governance',
  '/privacy',
  '/accessibility',
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function createWelcomeMessage(pathname: string): AssistantUiMessage {
  const welcome = getAssistantWelcome(pathname);
  return {
    id: `assistant-welcome-${welcome.contextLabel}`,
    role: 'assistant',
    content: welcome.answer,
    sources: welcome.sources,
    actions: welcome.actions,
    suggestions: welcome.suggestions,
    confidence: welcome.confidence,
  };
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function normalizeHrefPath(href: string) {
  const path = href.split('?')[0].split('#')[0];
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.replace(/\/+$/, '') || '/';
}

function getControlledPath(href: string) {
  const normalized = normalizeHrefPath(href);
  return pageControlledPaths
    .filter((path) => normalized === path || (path !== '/' && normalized.startsWith(`${path}/`)))
    .sort((left, right) => right.length - left.length)[0];
}

function canOpenHref(href: string, enabledPathSet: Set<string>) {
  if (isExternalHref(href) || href === '/ask') {
    return true;
  }

  const controlledPath = getControlledPath(href);
  return controlledPath ? enabledPathSet.has(controlledPath) : true;
}

function SourceLink({ source, enabledPathSet }: { source: AssistantSource; enabledPathSet: Set<string> }) {
  const isReachable = canOpenHref(source.href, enabledPathSet);
  const className =
    'assistant-source block rounded-xl p-3 text-left no-underline shadow-sm transition';
  const content = (
    <>
      <span className="theme-kicker block">Source</span>
      <span className="mt-1 block text-sm font-bold text-[color:var(--theme-text)]">{source.title}</span>
      <span className="mt-1 block text-xs leading-5 text-[color:var(--theme-text-muted)]">{source.description}</span>
      {!isReachable ? (
        <span className="mt-2 block text-xs font-bold text-amber-700">Page is currently off in navigation.</span>
      ) : null}
    </>
  );

  if (!isReachable) {
    return <div className={className}>{content}</div>;
  }

  if (isExternalHref(source.href)) {
    return (
      <a href={source.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={source.href} className={className}>
      {content}
    </Link>
  );
}

function ActionLink({ action, enabledPathSet }: { action: AssistantAction; enabledPathSet: Set<string> }) {
  const isReachable = canOpenHref(action.href, enabledPathSet);
  const isPrimary = action.priority === 'primary';
  const className = cx(
    'block rounded-xl border p-3 text-left no-underline shadow-sm transition',
    isPrimary ? 'assistant-action-primary' : 'assistant-action-secondary',
    !isReachable && 'cursor-not-allowed opacity-70 hover:translate-y-0',
  );
  const content = (
    <>
      <span className={cx('block text-sm font-extrabold', isPrimary ? 'text-white' : 'text-[color:var(--theme-text)]')}>
        {action.label}
      </span>
      <span className={cx('mt-1 block text-xs leading-5', isPrimary ? 'text-emerald-50' : 'text-[color:var(--theme-text-muted)]')}>
        {isReachable ? action.description : 'This page is currently off. An admin can enable it when ready.'}
      </span>
    </>
  );

  if (!isReachable) {
    return <div className={className}>{content}</div>;
  }

  if (isExternalHref(action.href)) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  );
}

function AssistantMessageBubble({
  message,
  enabledPathSet,
}: {
  message: AssistantUiMessage;
  enabledPathSet: Set<string>;
}) {
  const isUser = message.role === 'user';
  const visibleActions = message.actions?.slice(0, 3) ?? [];

  return (
    <div className={cx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cx(
          'max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
          isUser ? 'assistant-message assistant-message-user' : 'assistant-message assistant-message-ai',
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>
        {!isUser && visibleActions.length > 0 ? (
          <div className="mt-4 grid gap-2">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-[color:var(--theme-text-soft)]">
              Copilot next steps
            </p>
            {visibleActions.map((action) => (
              <ActionLink key={`${message.id}-${action.href}`} action={action} enabledPathSet={enabledPathSet} />
            ))}
          </div>
        ) : null}
        {!isUser && message.sources && message.sources.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {message.sources.slice(0, 2).map((source) => (
              <SourceLink key={`${message.id}-${source.href}`} source={source} enabledPathSet={enabledPathSet} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AetherAssistant({ variant = 'floating', enabledPaths = [] }: AetherAssistantProps) {
  const pathname = usePathname() || '/';
  const isFullPage = variant === 'page';
  const shouldHideFloating = !isFullPage && pathname === '/ask';
  const contextProfile = useMemo(() => getAssistantContextProfile(pathname), [pathname]);
  const enabledPathSet = useMemo(
    () => new Set(['/', ...enabledPaths, '/ask'].map(normalizeHrefPath)),
    [enabledPaths],
  );
  const [isOpen, setIsOpen] = useState(isFullPage);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<AssistantUiMessage[]>(() => [createWelcomeMessage(pathname)]);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const messageCounter = useRef(0);

  useEffect(() => {
    const welcomeMessage = createWelcomeMessage(pathname);

    setMessages((current) => {
      if (
        current.length !== 1 ||
        !current[0].id.startsWith('assistant-welcome-') ||
        current[0].id === welcomeMessage.id
      ) {
        return current;
      }

      return [welcomeMessage];
    });
  }, [pathname]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || isFullPage) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullPage, isOpen]);

  const nextId = useCallback((prefix: string) => {
    messageCounter.current += 1;
    return `${prefix}-${messageCounter.current}`;
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      const trimmed = messageText.trim();
      if (!trimmed || isSending) {
        return;
      }

      const userMessage: AssistantUiMessage = {
        id: nextId('user'),
        role: 'user',
        content: trimmed,
      };

      setMessages((current) => [...current, userMessage]);
      setInput('');
      setIsSending(true);

      try {
        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: trimmed,
            contextPath: pathname,
            history: messages.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok) {
          throw new Error('Assistant request failed');
        }

        const reply = (await response.json()) as AssistantReply;
        const assistantMessage: AssistantUiMessage = {
          id: nextId('assistant'),
          role: 'assistant',
          content: reply.answer,
          sources: reply.sources,
          actions: reply.actions,
          suggestions: reply.suggestions,
          confidence: reply.confidence,
        };

        setMessages((current) => [...current, assistantMessage]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: nextId('assistant-error'),
            role: 'assistant',
            content:
              'I could not reach the assistant endpoint. You can still use the full Ask Aether page or try again in a moment.',
            actions: [
              {
                label: 'Open full copilot',
                href: '/ask',
                description: 'Use the larger workspace for deeper questions across Aether.',
                priority: 'primary',
              },
            ],
            suggestions: ['What is Aether?', 'How does Peer Navigator work?', 'How would static RAG work?'],
            confidence: 'low',
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, nextId, pathname],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  const latestAssistantSuggestions = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.suggestions?.length)?.suggestions;

  const assistantPanel = (
    <section
      id={isFullPage ? undefined : 'ask-aether-floating-panel'}
      role={isFullPage ? undefined : 'dialog'}
      aria-label="Ask Aether assistant"
      aria-modal={isFullPage ? undefined : true}
      className={cx(
        'flex min-h-0 flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl',
        'assistant-panel',
        isFullPage
          ? 'h-[min(760px,calc(100vh-10rem))] rounded-3xl'
          : 'max-h-[min(720px,calc(100vh-7rem))] w-[min(440px,calc(100vw-1.5rem))] rounded-3xl',
      )}
    >
      <header className="assistant-header px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-100">Aether Copilot</p>
            <h2 className="mt-1 text-lg font-extrabold text-white">Guided next step</h2>
            <p className="mt-1 text-xs leading-5 text-emerald-50">
              Driving from: <span className="font-bold text-white">{contextProfile.label}</span>
            </p>
          </div>
          {!isFullPage ? (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-9 w-9 rounded-full border border-white/15 bg-white/10 text-sm font-black text-white transition hover:bg-white/20"
              aria-label="Close Ask Aether"
            >
              X
            </button>
          ) : null}
        </div>
      </header>

      <div ref={transcriptRef} className="assistant-transcript min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <AssistantMessageBubble key={message.id} message={message} enabledPathSet={enabledPathSet} />
        ))}
        {isSending ? (
          <div className="flex justify-start">
            <div className="theme-card rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--theme-text-muted)]">
              Choosing the next useful step...
            </div>
          </div>
        ) : null}
      </div>

      <div className="assistant-composer p-4">
        {latestAssistantSuggestions && latestAssistantSuggestions.length > 0 ? (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {latestAssistantSuggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void sendMessage(suggestion)}
                className="theme-pill shrink-0 px-3 py-1.5 text-xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor={isFullPage ? 'ask-aether-page-input' : 'ask-aether-floating-input'} className="sr-only">
            Ask Aether
          </label>
          <textarea
            id={isFullPage ? 'ask-aether-page-input' : 'ask-aether-floating-input'}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            rows={isFullPage ? 3 : 2}
            placeholder="Ask about this page, Peer Navigator, privacy, RAG, or where to start..."
            className="assistant-input max-h-36 min-h-[4.5rem] w-full resize-none rounded-2xl px-4 py-3 text-sm leading-6 shadow-inner outline-none transition placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.72rem] leading-5 text-[color:var(--theme-text-soft)]">
              Informational only. Not emergency, clinical, legal, or crisis care.
            </p>
            <button
              type="submit"
              disabled={isSending || input.trim().length === 0}
              className="theme-button theme-button-primary shrink-0 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );

  if (isFullPage) {
    return assistantPanel;
  }

  if (shouldHideFloating) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? assistantPanel : null}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="assistant-launcher group flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition"
        aria-expanded={isOpen}
        aria-controls="ask-aether-floating-panel"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--theme-gold)] text-sm font-black text-[color:var(--theme-text)]">
          AI
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-extrabold">Aether Copilot</span>
          <span className="block text-xs text-emerald-50">Guides your next step</span>
        </span>
      </button>
      {!isOpen ? (
        <Link
          href="/ask"
          className="hidden rounded-full border border-[color:var(--theme-border)] bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[color:var(--theme-text-muted)] no-underline shadow-lg transition hover:bg-[color:var(--theme-bg-soft)] hover:text-[color:var(--theme-text)] sm:inline-flex"
        >
          Open full copilot
        </Link>
      ) : null}
    </div>
  );
}
