import Link from 'next/link';
import type { AppPageDefinition } from '../../lib/page-flags';
import { isPathEnabledForRequest } from '../../lib/page-flags';

type SiteReturnLoopProps = {
  sections: Array<Pick<AppPageDefinition, 'path' | 'name' | 'description'>>;
};

const priorityPaths = ['/resilience-pathway', '/echo', '/peer-navigator', '/blog', '/about', '/privacy', '/mentors'];

function getPreferredSections(sections: SiteReturnLoopProps['sections']) {
  const byPath = new Map(sections.map((section) => [section.path, section]));
  const prioritized = priorityPaths
    .map((path) => byPath.get(path))
    .filter((section): section is SiteReturnLoopProps['sections'][number] => Boolean(section));

  const fallback = sections.filter((section) => section.path !== '/' && section.path !== '/feedback');
  const merged = [...prioritized, ...fallback];
  const seen = new Set<string>();

  return merged
    .filter((section) => {
      if (seen.has(section.path)) {
        return false;
      }

      seen.add(section.path);
      return true;
    })
    .slice(0, 3);
}

export default function SiteReturnLoop({ sections }: SiteReturnLoopProps) {
  const preferredSections = getPreferredSections(sections);
  const feedbackEnabled = isPathEnabledForRequest('/feedback');

  if (preferredSections.length === 0) {
    return null;
  }

  return (
    <section className="site-return-loop" aria-label="Continue exploring Aether">
      <div className="site-return-loop-inner">
        <div className="site-return-loop-heading">
          <p className="theme-kicker">Return path</p>
          <h2>Come back for the next useful step.</h2>
          <p>
            Aether is designed as a repeatable support loop: orient the moment, reflect privately, choose a pathway,
            and keep trust visible.
          </p>
        </div>

        <div className="site-return-loop-grid">
          {preferredSections.map((section) => (
            <Link key={section.path} href={section.path} className="site-return-loop-card">
              <span>{section.name}</span>
              <strong>{section.description}</strong>
            </Link>
          ))}
        </div>

        <div className="site-return-loop-actions">
          <Link href="/ask" className="theme-button theme-button-primary px-5 py-3">
            Ask Aether
          </Link>
          {feedbackEnabled ? (
            <Link href="/feedback" className="theme-button theme-button-secondary px-5 py-3">
              Share feedback
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
