import AetherAssistant from '../../components/assistant/AetherAssistant';
import { JsonLd } from '../../components/page/PagePrimitives';
import { getAllPages } from '../../lib/page-flags';
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
  const askStarters = [
    'I feel overwhelmed. Where can I begin?',
    'Explain Aether in simple words.',
    'How does Aether protect privacy?',
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

      <section className="ask-hero ask-hero-calm">
        <div className="min-w-0">
          <p className="theme-kicker">A quieter way to find your next step</p>
          <h1>Ask Aether</h1>
          <p>
            Start with what is on your mind. Aether will keep the answer clear, show the material it used, and offer one useful next move.
          </p>
          <div className="ask-hero-signals" aria-label="Ask Aether principles">
            <span>Grounded in Aether content</span>
            <span>Sources stay visible</span>
            <span>Not crisis care</span>
          </div>
        </div>
      </section>

      <AetherAssistant variant="page" enabledPaths={enabledPaths} controlledPaths={controlledPaths} starterPrompts={askStarters} />

      <p className="ask-safety-note">
        Aether is informational support, not emergency or crisis care. If there is immediate danger in the United States, call or text 988.
      </p>
    </section>
  );
}
