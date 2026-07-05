import AetherAssistant from '../../components/assistant/AetherAssistant';
import StarterPromptList from '../../components/assistant/StarterPromptList';
import { JsonLd } from '../../components/page/PagePrimitives';
import { getAllPages } from '../../lib/page-flags';
import { getRagIndexMetadata } from '../../lib/rag/search';
import { createPageMetadata, createWebPageJsonLd, getPrimarySiteSectionsForRequest } from '../../lib/site';

export const metadata = createPageMetadata({
  title: 'Ask Aether',
  description: 'A context-aware conversational guide for Aether content, product pathways, privacy, and peer support design.',
  path: '/ask',
  keywords: ['Aether assistant', 'conversational guide', 'student resilience AI', 'RAG assistant'],
});

export default function AskAetherPage() {
  const enabledSections = getPrimarySiteSectionsForRequest();
  const enabledPaths = enabledSections.map((section) => section.path);
  const controlledPaths = getAllPages().map((page) => page.path);
  const ragMetadata = getRagIndexMetadata();
  const askStarters = [
    'Where should I start if I feel overwhelmed?',
    'Compare privacy, Echo, and the Resilience Hub.',
    'What sources support Peer Navigator?',
    'Explain Aether in simple words.',
  ];
  const retrievalModes = [
    { label: 'Grounded', description: 'Answers come from indexed Aether content and source cards.' },
    { label: 'Flexible', description: 'The assistant works across enabled pages and knowledge-base documents.' },
    { label: 'Bounded', description: 'Safety, crisis, and privacy boundaries override normal guidance.' },
  ];
  const usageSteps = [
    'Start with one short question.',
    'Use source cards to verify what matters.',
    'Turn the answer into one next step on a product page.',
  ];
  const webPageJsonLd = createWebPageJsonLd({
    name: 'Ask Aether',
    path: '/ask',
    description:
      'A context-aware conversational guide for Aether content, product pathways, privacy, and peer support design.',
    about: ['conversational AI', 'student resilience', 'retrieval augmented generation', 'peer support'],
  });

  return (
    <section className="ask-page mx-auto grid min-w-0 max-w-7xl gap-6">
      <JsonLd data={webPageJsonLd} idPrefix="ask-aether-jsonld" />

      <section className="ask-hero">
        <div className="min-w-0">
          <p className="theme-kicker">Grounded resilience copilot</p>
          <h1>Ask Aether</h1>
          <p>
            Ask across the Aether product, journal, and design knowledge base. The assistant retrieves from approved
            content, cites what it used, and turns answers into safe next steps.
          </p>
        </div>
        <div className="ask-rag-status" aria-label="Retrieval status">
          <p className="theme-kicker">RAG index</p>
          <strong>{ragMetadata.chunkCount} chunks</strong>
          <span>{ragMetadata.retrievalType} retrieval</span>
        </div>
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <AetherAssistant
            variant="page"
            enabledPaths={enabledPaths}
            controlledPaths={controlledPaths}
            starterPrompts={askStarters}
          />
        </div>

        <aside className="ask-sidebar min-w-0 space-y-4">
          <section className="theme-card p-5">
            <p className="theme-kicker">Fast start</p>
            <h2 className="mt-2 text-lg font-extrabold text-[color:var(--theme-text)]">Use the assistant in 3 steps</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              {usageSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="theme-card p-5">
            <p className="theme-kicker">Starter prompts</p>
            <h2 className="mt-2 text-lg font-extrabold text-[color:var(--theme-text)]">Copy and ask</h2>
            <StarterPromptList prompts={askStarters} />
          </section>

          <section className="theme-card p-5">
            <p className="theme-kicker">Retrieval behavior</p>
            <div className="mt-4 grid gap-3">
              {retrievalModes.map((mode) => (
                <article key={mode.label} className="ask-mode">
                  <strong>{mode.label}</strong>
                  <span>{mode.description}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="theme-card p-5">
            <p className="theme-kicker">Enabled surfaces</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {enabledSections.map((section) => (
                <span key={section.path} className="theme-pill min-h-0 rounded-[var(--theme-radius-sm)] px-2 py-1 text-[0.68rem]">
                  {section.name}
                </span>
              ))}
            </div>
          </section>

          <section className="theme-card border-[rgba(232,111,87,0.32)] bg-[rgb(255_248_241/0.86)] p-5">
            <p className="theme-kicker">Safety boundary</p>
            <h2 className="mt-2 text-lg font-extrabold text-[color:var(--theme-text)]">Not crisis care</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              This assistant is informational. It is not emergency support, therapy, diagnosis, legal advice, or crisis
              care. In the United States, call or text 988 for urgent mental health crisis support.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
