export type CmsPageId =
  | 'global-shell'
  | 'home'
  | 'about'
  | 'accessibility'
  | 'ask'
  | 'blog'
  | 'blog-post'
  | 'echo'
  | 'fairness-governance'
  | 'feedback'
  | 'mentors'
  | 'peer-navigator'
  | 'privacy'
  | 'resilience-pathway';

export type CmsPageDefinition = {
  id: CmsPageId;
  path: string;
  name: string;
  description: string;
};

export const CMS_EDITABLE_PAGES: readonly CmsPageDefinition[] = [
  {
    id: 'global-shell',
    path: '/__global-shell',
    name: 'Global Header & Footer',
    description: 'Global shell content shared across all pages.',
  },
  {
    id: 'home',
    path: '/',
    name: 'Home',
    description: 'Landing page introducing Aether, support pathways, and trust posture.',
  },
  {
    id: 'about',
    path: '/about',
    name: 'About',
    description: 'Mission, operating principles, and product boundaries.',
  },
  {
    id: 'accessibility',
    path: '/accessibility',
    name: 'Accessibility',
    description: 'Accessibility commitments and SAFE-AI compliance guidance.',
  },
  {
    id: 'ask',
    path: '/ask',
    name: 'Ask Aether',
    description: 'Assistant experience, retrieval behavior, and safety boundaries.',
  },
  {
    id: 'blog',
    path: '/blog',
    name: 'Blog Index',
    description: 'Journal landing page and article navigation.',
  },
  {
    id: 'blog-post',
    path: '/blog/[slug]',
    name: 'Blog Post Template',
    description: 'Shared template override for all blog detail pages.',
  },
  {
    id: 'echo',
    path: '/echo',
    name: 'Echo Chamber',
    description: 'Voice reflection surface and sentiment mapping entry point.',
  },
  {
    id: 'fairness-governance',
    path: '/fairness-governance',
    name: 'Fairness & Governance',
    description: 'Policy, fairness metrics, and governance transparency.',
  },
  {
    id: 'feedback',
    path: '/feedback',
    name: 'Feedback',
    description: 'Structured issue and improvement intake experience.',
  },
  {
    id: 'mentors',
    path: '/mentors',
    name: 'Mentors',
    description: 'Mentor recognition and acknowledgment page.',
  },
  {
    id: 'peer-navigator',
    path: '/peer-navigator',
    name: 'Peer-Navigator',
    description: 'Peer matching demo and transparency workflow.',
  },
  {
    id: 'privacy',
    path: '/privacy',
    name: 'Privacy',
    description: 'Privacy-by-design and ethical data handling commitments.',
  },
  {
    id: 'resilience-pathway',
    path: '/resilience-pathway',
    name: 'Resilience Pathway',
    description: 'Resilience hub with check-ins, planning, and support navigation.',
  },
] as const;

const editablePageById = new Map<CmsPageId, CmsPageDefinition>(CMS_EDITABLE_PAGES.map((page) => [page.id, page]));
const editablePageByPath = new Map<string, CmsPageDefinition>(CMS_EDITABLE_PAGES.map((page) => [page.path, page]));

function normalizePath(path: string): string {
  const withoutQuery = path.split('?')[0].split('#')[0];
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length === 0 ? '/' : trimmed;
}

export function getCmsEditablePageById(pageId: string): CmsPageDefinition | undefined {
  return editablePageById.get(pageId as CmsPageId);
}

export function getCmsEditablePageByPath(path: string): CmsPageDefinition | undefined {
  const normalized = normalizePath(path);

  const exact = editablePageByPath.get(normalized);
  if (exact) {
    return exact;
  }

  if (normalized.startsWith('/blog/')) {
    return editablePageById.get('blog-post');
  }

  return undefined;
}

export function isCmsEditablePath(path: string): boolean {
  return Boolean(getCmsEditablePageByPath(path));
}
