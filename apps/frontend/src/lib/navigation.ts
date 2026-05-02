import type { AppPageId } from './page-flags';
import {
  isPageEnabled,
  isPageEnabledForRequest,
  isPathEnabled,
  isPathEnabledForRequest,
} from './page-flags';

export type NavigationLink = {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
};

export type NavigationGroup = {
  title: string;
  links: NavigationLink[];
};

type ConfigurableNavigationLink = NavigationLink & {
  requiresPage?: AppPageId;
};

const primaryNavigationConfig: ConfigurableNavigationLink[] = [
  {
    href: '/resilience-pathway',
    label: 'Resilience Hub',
    description: 'Guided check-ins, safety planning, resource routing, peer circles, and habits.',
    requiresPage: 'resilience-pathway',
  },
  {
    href: '/echo',
    label: 'Echo',
    description: 'Private reflection with on-device transcript and sentiment mapping.',
    requiresPage: 'echo',
  },
  {
    href: '/peer-navigator',
    label: 'Peer Navigator',
    description: 'Privacy-aware peer matching with explainable fairness controls.',
    requiresPage: 'peer-navigator',
  },
  {
    href: '/blog',
    label: 'Journal',
    description: 'Practical, evidence-informed student resilience guides.',
    requiresPage: 'blog',
  },
];

const secondaryNavigationConfig: ConfigurableNavigationLink[] = [
  {
    href: '/fairness-governance',
    label: 'Governance',
    description: 'Fairness metrics, policy posture, and auditability.',
    requiresPage: 'fairness-governance',
  },
  {
    href: '/privacy',
    label: 'Privacy',
    description: 'Local-first design, minimized data exposure, and identity safety.',
    requiresPage: 'privacy',
  },
  {
    href: '/accessibility',
    label: 'Accessibility',
    description: 'Inclusive design commitments and SAFE-AI guidance.',
    requiresPage: 'accessibility',
  },
  {
    href: '/about',
    label: 'About',
    description: 'Mission, architecture, and product context.',
    requiresPage: 'about',
  },
  {
    href: '/mentors',
    label: 'Mentors',
    description: 'Public gratitude for the guidance behind Aether.',
    requiresPage: 'mentors',
  },
];

export const trustSignals = [
  'Privacy-first',
  'Peer support',
  'Safety-aware',
  'AI-readable',
] as const;

const footerNavigationConfig: Array<{
  title: string;
  links: ConfigurableNavigationLink[];
}> = [
  {
    title: 'Product',
    links: [
      { href: '/resilience-pathway', label: 'Resilience Hub', requiresPage: 'resilience-pathway' },
      { href: '/echo', label: 'Echo Chamber', requiresPage: 'echo' },
      { href: '/peer-navigator', label: 'Peer Navigator', requiresPage: 'peer-navigator' },
      { href: '/blog', label: 'Aether Journal', requiresPage: 'blog' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/privacy', label: 'Privacy', requiresPage: 'privacy' },
      { href: '/accessibility', label: 'Accessibility', requiresPage: 'accessibility' },
      { href: '/fairness-governance', label: 'Fairness Governance', requiresPage: 'fairness-governance' },
      { href: 'https://988lifeline.org/', label: '988 Lifeline', external: true },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About Aether', requiresPage: 'about' },
      { href: '/mentors', label: 'Mentors', requiresPage: 'mentors' },
      { href: '/feed.xml', label: 'RSS Feed', requiresPage: 'blog' },
      { href: '/llms.txt', label: 'AI Guide' },
    ],
  },
  {
    title: 'Machine-Readable',
    links: [
      { href: '/sitemap.xml', label: 'Sitemap' },
      { href: '/image-sitemap.xml', label: 'Image Sitemap' },
      { href: '/robots.txt', label: 'Robots' },
      { href: '/manifest.webmanifest', label: 'Web Manifest' },
    ],
  },
];

function isConfigurableLinkEnabled(
  link: ConfigurableNavigationLink,
  pageEnabled: (pageId: AppPageId) => boolean,
  pathEnabled: (path: string) => boolean,
): boolean {
  if (link.requiresPage) {
    return pageEnabled(link.requiresPage);
  }

  if (!link.external && link.href.startsWith('/')) {
    return pathEnabled(link.href);
  }

  return true;
}

function toNavigationLink(link: ConfigurableNavigationLink): NavigationLink {
  return {
    href: link.href,
    label: link.label,
    description: link.description,
    external: link.external,
  };
}

export const primaryNavigation: NavigationLink[] = primaryNavigationConfig
  .filter((link) => isConfigurableLinkEnabled(link, isPageEnabled, isPathEnabled))
  .map(toNavigationLink);

export const secondaryNavigation: NavigationLink[] = secondaryNavigationConfig
  .filter((link) => isConfigurableLinkEnabled(link, isPageEnabled, isPathEnabled))
  .map(toNavigationLink);

export const footerNavigation: NavigationGroup[] = footerNavigationConfig
  .map((group) => ({
    title: group.title,
    links: group.links
      .filter((link) => isConfigurableLinkEnabled(link, isPageEnabled, isPathEnabled))
      .map(toNavigationLink),
  }))
  .filter((group) => group.links.length > 0);

export function getPrimaryNavigationForRequest(): NavigationLink[] {
  return primaryNavigationConfig
    .filter((link) => isConfigurableLinkEnabled(link, isPageEnabledForRequest, isPathEnabledForRequest))
    .map(toNavigationLink);
}

export function getSecondaryNavigationForRequest(): NavigationLink[] {
  return secondaryNavigationConfig
    .filter((link) => isConfigurableLinkEnabled(link, isPageEnabledForRequest, isPathEnabledForRequest))
    .map(toNavigationLink);
}

export function getFooterNavigationForRequest(): NavigationGroup[] {
  return footerNavigationConfig
    .map((group) => ({
      title: group.title,
      links: group.links
        .filter((link) => isConfigurableLinkEnabled(link, isPageEnabledForRequest, isPathEnabledForRequest))
        .map(toNavigationLink),
    }))
    .filter((group) => group.links.length > 0);
}
