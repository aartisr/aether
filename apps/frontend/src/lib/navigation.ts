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
    href: '/',
    label: 'Home',
    description: 'Overview of the Aether platform and supported pages.',
    requiresPage: 'home',
  },
  {
    href: '/echo',
    label: 'Echo Chamber',
    description: 'Private, on-device voice reflection with transcript and sentiment mapping.',
    requiresPage: 'echo',
  },
  {
    href: '/peer-navigator',
    label: 'Peer-Navigator',
    description: 'Privacy-aware peer matching demo for identity-safe student support.',
    requiresPage: 'peer-navigator',
  },
  {
    href: '/mentors',
    label: 'Mentors',
    description: 'Public gratitude for the guidance behind Aether.',
    requiresPage: 'mentors',
  },
  {
    href: '/blog',
    label: 'Journal',
    description: 'Practical, evidence-informed student resilience guides.',
    requiresPage: 'blog',
  },
  {
    href: '/about',
    label: 'About',
    description: 'Mission, boundaries, and product context.',
    requiresPage: 'about',
  },
];

const secondaryNavigationConfig: ConfigurableNavigationLink[] = [
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
  {
    href: '/feedback',
    label: 'Feedback',
    description: 'Report an issue, request a fix, or suggest what Aether should add next.',
    requiresPage: 'feedback',
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
      { href: '/', label: 'Home', requiresPage: 'home' },
      { href: '/mentors', label: 'Mentors', requiresPage: 'mentors' },
      { href: '/blog', label: 'Aether Journal', requiresPage: 'blog' },
      { href: '/about', label: 'About Aether', requiresPage: 'about' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/privacy', label: 'Privacy', requiresPage: 'privacy' },
      { href: '/accessibility', label: 'Accessibility', requiresPage: 'accessibility' },
      { href: 'https://988lifeline.org/', label: '988 Lifeline', external: true },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About Aether', requiresPage: 'about' },
      { href: '/mentors', label: 'Mentors', requiresPage: 'mentors' },
      { href: '/feedback', label: 'Feedback', requiresPage: 'feedback' },
      { href: '/feed.xml', label: 'RSS Feed', requiresPage: 'blog' },
      { href: '/llms.txt', label: 'AI Guide' },
    ],
  },
  {
    title: 'Machine-Readable',
    links: [
      { href: '/sitemap.xml', label: 'Sitemap' },
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
