'use client';

import { useState } from 'react';

type StarterPromptListProps = {
  prompts: string[];
};

export default function StarterPromptList({ prompts }: StarterPromptListProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  async function handleCopy(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      window.setTimeout(() => {
        setCopiedPrompt((current) => (current === prompt ? null : current));
      }, 1400);
    } catch {
      setCopiedPrompt(null);
    }
  }

  return (
    <div className="mt-4 grid gap-2">
      {prompts.map((prompt) => {
        const isCopied = copiedPrompt === prompt;

        return (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              void handleCopy(prompt);
            }}
            className="rounded-[var(--theme-radius-md)] border border-[color:var(--theme-border)] bg-white px-3 py-2 text-left text-sm font-semibold text-[color:var(--theme-text)] shadow-[var(--theme-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[color:var(--theme-border-strong)]"
            aria-label={`Copy starter prompt: ${prompt}`}
          >
            <span className="block">{prompt}</span>
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--theme-primary-strong)]">
              {isCopied ? 'Copied' : 'Copy prompt'}
            </span>
          </button>
        );
      })}
    </div>
  );
}