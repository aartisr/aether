import AetherAssistant from '../../components/assistant/AetherAssistant';
import { JsonLd } from '../../components/page/PagePrimitives';
import { createPageMetadata, createWebPageJsonLd, getPrimarySiteSectionsForRequest } from '../../lib/site';

export const metadata = createPageMetadata({
  title: 'Ask Aether',
  description: 'A context-aware conversational guide for Aether content, product pathways, privacy, and peer support design.',
  path: '/ask',
  keywords: ['Aether assistant', 'conversational guide', 'student resilience AI', 'RAG assistant'],
});

export default function AskAetherPage() {
  const enabledPaths = getPrimarySiteSectionsForRequest().map((section) => section.path);
  const webPageJsonLd = createWebPageJsonLd({
    name: 'Ask Aether',
    path: '/ask',
    description:
      'A context-aware conversational guide for Aether content, product pathways, privacy, and peer support design.',
    about: ['conversational AI', 'student resilience', 'retrieval augmented generation', 'peer support'],
  });

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <JsonLd data={webPageJsonLd} idPrefix="ask-aether-jsonld" />
      <div className="min-w-0">
        <AetherAssistant variant="page" enabledPaths={enabledPaths} />
      </div>

      <aside className="space-y-4">
        <section className="theme-band p-5">
          <p className="theme-kicker">Copilot workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[color:var(--theme-text)]">Ask Aether</h1>
          <p className="mt-3 text-sm leading-6 text-[color:var(--theme-text-muted)]">
            Use this page for broader questions across Aether. The floating copilot follows the current page and turns
            answers into next-step actions.
          </p>
        </section>

        <section className="theme-card p-5">
          <h2 className="text-lg font-extrabold text-[color:var(--theme-text)]">Good asks</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[color:var(--theme-text-muted)]">
            <li>Drive me through the best next step.</li>
            <li>Explain this page and where I should go next.</li>
            <li>How does Peer Navigator work?</li>
            <li>How should static RAG be implemented here?</li>
          </ul>
        </section>

        <section className="theme-card p-5">
          <h2 className="text-lg font-extrabold text-[color:var(--theme-text)]">How it drives</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">
            It reads the current route, answers from approved Aether content, cites sources, and shows action cards that
            respect pages currently turned on by admin controls.
          </p>
        </section>

        <section className="theme-card border-[rgba(232,111,87,0.32)] bg-[rgb(255_248_241/0.86)] p-5">
          <h2 className="text-lg font-extrabold text-[color:var(--theme-text)]">Safety boundary</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">
            This assistant is informational. It is not emergency support, therapy, diagnosis, legal advice, or crisis
            care. In the United States, call or text 988 for urgent mental health crisis support.
          </p>
        </section>
      </aside>
    </section>
  );
}
