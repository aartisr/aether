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
    href: '/mentors',
    label: 'Mentors',
    description: 'Public gratitude for the guidance behind Aether.',
    requiresPage: 'mentors',
  },
];

const secondaryNavigationConfig: ConfigurableNavigationLink[] = [];

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
