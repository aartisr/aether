import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

export type AppPageId =
  | 'home'
  | 'resilience-pathway'
  | 'echo'
  | 'peer-navigator'
  | 'blog'
  | 'fairness-governance'
  | 'privacy'
  | 'accessibility'
  | 'about'
  | 'mentors';

export type AppPageDefinition = {
  id: AppPageId;
  path: string;
  name: string;
  description: string;
};

type PageOverrides = {
  enabled: Set<AppPageId>;
  disabled: Set<AppPageId>;
  mode: 'enabled' | 'disabled' | 'none';
};

type PageOverridesJson = {
  enabled?: string[];
  disabled?: string[];
};

export const PAGE_FLAGS_COOKIE_NAME = 'aether_page_flags';

const appPages: readonly AppPageDefinition[] = [
  {
    id: 'home',
    path: '/',
    name: 'Homepage',
    description: 'Overview of the Aether student resilience ecosystem and core product pathways.',
  },
  {
    id: 'resilience-pathway',
    path: '/resilience-pathway',
    name: 'Resilience Pathway',
    description: 'Interactive resilience hub covering check-ins, safety planning, navigation, peer circles, and habits.',
  },
  {
    id: 'echo',
    path: '/echo',
    name: 'Echo Chamber',
    description: 'Private, on-device voice reflection with transcript and sentiment mapping.',
  },
  {
    id: 'peer-navigator',
    path: '/peer-navigator',
    name: 'Peer-Navigator',
    description: 'Privacy-aware peer matching demo for identity-safe student support.',
  },
  {
    id: 'fairness-governance',
    path: '/fairness-governance',
    name: 'Fairness & Governance',
    description: 'Transparency layer for fairness metrics, policy, and auditability.',
  },
  {
    id: 'privacy',
    path: '/privacy',
    name: 'Privacy',
    description: 'Privacy-by-design approach including federated learning, minimized data exposure, and safety guardrails.',
  },
  {
    id: 'accessibility',
    path: '/accessibility',
    name: 'Accessibility',
    description: 'Accessibility commitments, inclusive design approach, and SAFE-AI guidance.',
  },
  {
    id: 'about',
    path: '/about',
    name: 'About',
    description: 'Background, positioning, and product summary for Aether.',
  },
  {
    id: 'blog',
    path: '/blog',
    name: 'Blog',
    description: 'Evidence-informed resilience articles, product notes, and practical student guidance.',
  },
  {
    id: 'mentors',
    path: '/mentors',
    name: 'Mentor Appreciation',
    description: 'A public acknowledgment of mentors who shaped strategy, ethics, and implementation.',
  },
] as const;

const appPageIdSet = new Set<AppPageId>(appPages.map((page) => page.id));
const pageById = new Map<AppPageId, AppPageDefinition>(appPages.map((page) => [page.id, page]));
const pageByPath = new Map<string, AppPageDefinition>(appPages.map((page) => [page.path, page]));

function parsePageIdList(raw: string | undefined): Set<AppPageId> {
  if (!raw) return new Set<AppPageId>();

  return raw
    .split(',')
    .map((value) => value.trim() as AppPageId)
    .filter((value): value is AppPageId => appPageIdSet.has(value))
    .reduce((acc, value) => {
      acc.add(value);
      return acc;
    }, new Set<AppPageId>());
}

const enabledPagesOverride = parsePageIdList(process.env.NEXT_PUBLIC_ENABLED_PAGES);
const disabledPagesOverride = parsePageIdList(process.env.NEXT_PUBLIC_DISABLED_PAGES);

const configuredOverrides: PageOverrides = {
  enabled: enabledPagesOverride,
  disabled: disabledPagesOverride,
  mode:
    enabledPagesOverride.size > 0
      ? 'enabled'
      : disabledPagesOverride.size > 0
        ? 'disabled'
        : 'none',
};

function applyOverrides(pageId: AppPageId, overrides: PageOverrides): boolean {
  if (pageId === 'home') {
    return true;
  }

  if (overrides.mode === 'enabled') {
    return overrides.enabled.has(pageId);
  }

  if (overrides.mode === 'none') {
    return true;
  }

  return !overrides.disabled.has(pageId);
}

function normalizeOverrides(input: PageOverridesJson): PageOverrides {
  const mode = Array.isArray(input.enabled)
    ? 'enabled'
    : Array.isArray(input.disabled)
      ? 'disabled'
      : 'none';

  return {
    enabled: parsePageIdList(input.enabled?.join(',')),
    disabled: parsePageIdList(input.disabled?.join(',')),
    mode,
  };
}

export function serializePageOverridesCookie(input: { enabled?: AppPageId[]; disabled?: AppPageId[] }): string {
  const payload: PageOverridesJson = {
    enabled: input.enabled ?? [],
    disabled: input.disabled ?? [],
  };
  return JSON.stringify(payload);
}

export function parsePageOverridesCookie(raw: string | undefined): PageOverrides | undefined {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as PageOverridesJson;
    return normalizeOverrides(parsed);
  } catch {
    return undefined;
  }
}

export function getRequestPageOverrides(): PageOverrides | undefined {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(PAGE_FLAGS_COOKIE_NAME)?.value;
    return parsePageOverridesCookie(raw);
  } catch {
    return undefined;
  }
}

export function isPageEnabled(pageId: AppPageId): boolean {
  return applyOverrides(pageId, configuredOverrides);
}

export function isPageEnabledForRequest(pageId: AppPageId): boolean {
  const requestOverrides = getRequestPageOverrides();
  return applyOverrides(pageId, requestOverrides ?? configuredOverrides);
}

export function getPageById(pageId: AppPageId): AppPageDefinition {
  return pageById.get(pageId) as AppPageDefinition;
}

export function getPageByPath(path: string): AppPageDefinition | undefined {
  return pageByPath.get(path);
}

export function isPathEnabled(path: string): boolean {
  const page = getPageByPath(path);
  return page ? isPageEnabled(page.id) : true;
}

export function isPathEnabledForRequest(path: string): boolean {
  const page = getPageByPath(path);
  return page ? isPageEnabledForRequest(page.id) : true;
}

export function assertPageEnabled(pageId: AppPageId): void {
  if (!isPageEnabled(pageId)) {
    notFound();
  }
}

export function assertPageEnabledForRequest(pageId: AppPageId): void {
  if (!isPageEnabledForRequest(pageId)) {
    notFound();
  }
}

export function getEnabledPages(ids?: readonly AppPageId[]): AppPageDefinition[] {
  if (!ids || ids.length === 0) {
    return appPages.filter((page) => isPageEnabled(page.id));
  }

  return ids
    .filter((id) => isPageEnabled(id))
    .map((id) => getPageById(id));
}

export function getEnabledPagesForRequest(ids?: readonly AppPageId[]): AppPageDefinition[] {
  if (!ids || ids.length === 0) {
    return appPages.filter((page) => isPageEnabledForRequest(page.id));
  }

  return ids
    .filter((id) => isPageEnabledForRequest(id))
    .map((id) => getPageById(id));
}

export function getAllPages(): AppPageDefinition[] {
  return [...appPages];
}
