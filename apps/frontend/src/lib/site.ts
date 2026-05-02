import type { Metadata } from 'next';
import { getEnabledPages, getEnabledPagesForRequest } from './page-flags';

const fallbackSiteUrl = 'https://aether-resilience.vercel.app';

function getConfiguredSiteUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL
  );
}

function normalizeSiteUrl(input?: string): string {
  if (!input) {
    return fallbackSiteUrl;
  }

  const candidate = input.startsWith('http://') || input.startsWith('https://') ? input : `https://${input}`;

  try {
    return new URL(candidate).toString().replace(/\/$/, '');
  } catch {
    return fallbackSiteUrl;
  }
}

export const siteUrl = normalizeSiteUrl(getConfiguredSiteUrl());
export const siteName = 'Aether';
export const siteTitle = 'Aether: Student Resiliency Ecosystem';
export const siteDescription =
  'A research-driven, privacy-first student resilience platform for mental wellbeing, guided support, and practical recovery pathways.';
export const shareTagline =
  'Privacy-first student resilience support with guided pathways, peer connection, and transparent AI.';
export const siteKeywords = [
  'student wellbeing',
  'student resilience',
  'mental health resilience',
  'peer support',
  'college student mental health',
  'resilience pathway',
  'privacy-first wellbeing tools',
  'campus wellbeing technology',
  'accessible mental wellbeing support',
  'AI student wellbeing',
  'student mental health app',
  'resilience toolkit',
  'generative engine optimization',
  'AI-search friendly wellbeing platform',
];
export const authorName = 'Aarti S Ravikumar';
export const authorUrl = 'https://aartisr.foreverlotus.com';
export const organizationSameAs = [authorUrl];
export const socialPreviewImage = '/opengraph-image';
export const siteLocale = 'en_US';
export const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '';
export const supportedLocaleAlternates = [
  { code: 'en-US', pathPrefix: '' },
] as const;

export function normalizedTwitterHandle(handle: string) {
  if (!handle) return '';
  return handle.startsWith('@') ? handle : `@${handle}`;
}

export const socialProfiles = [
  ...organizationSameAs,
  ...(twitterHandle ? [`https://twitter.com/${twitterHandle.replace(/^@/, '')}`] : []),
];

export const entityTopics = [
  'student resilience',
  'student mental wellbeing',
  'privacy-first AI',
  'peer support',
  'campus wellbeing programs',
  'accessible technology',
  'responsible AI governance',
  'safety planning',
  'habit formation',
  'student support navigation',
];

function toSiteSections(pages: ReturnType<typeof getEnabledPages>) {
  return pages.map((page) => ({
    path: page.path,
    name: page.name,
    description: page.description,
  }));
}

export const primarySiteSections = toSiteSections(getEnabledPages());

export function getPrimarySiteSectionsForRequest() {
  return toSiteSections(getEnabledPagesForRequest());
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
  absoluteTitle?: boolean;
  type?: 'website' | 'article';
};

type ArticleMetadataInput = {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
};

type ItemListEntry = {
  name: string;
  url: string;
  description?: string;
};

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function createLanguageAlternates(path: string): Record<string, string> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return supportedLocaleAlternates.reduce<Record<string, string>>((acc, locale) => {
    const localizedPath = locale.pathPrefix
      ? `${locale.pathPrefix}${normalizedPath}`.replace(/\/+/g, '/')
      : normalizedPath;
    acc[locale.code] = toAbsoluteUrl(localizedPath);
    return acc;
  }, {});
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  imagePath = socialPreviewImage,
  absoluteTitle = false,
  type = 'website',
}: PageMetadataInput): Metadata {
  const mergedKeywords = Array.from(new Set([...siteKeywords, ...keywords]));
  const normalizedHandle = normalizedTwitterHandle(twitterHandle);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    abstract: description,
    keywords: mergedKeywords,
    authors: [{ name: authorName, url: authorUrl }],
    creator: authorName,
    publisher: siteName,
    alternates: {
      canonical: toAbsoluteUrl(path),
      languages: createLanguageAlternates(path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type,
      title,
      description,
      url: toAbsoluteUrl(path),
      siteName,
      locale: siteLocale,
      images: [
        {
          url: toAbsoluteUrl(imagePath),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [toAbsoluteUrl(imagePath)],
      ...(normalizedHandle ? { creator: normalizedHandle, site: normalizedHandle } : {}),
    },
    other: {
      'ai-canonical-url': toAbsoluteUrl(path),
      'ai-content-type': type,
      'audience': 'students, campus wellbeing teams, mentors, researchers',
    },
  };
}

export function createArticleMetadata({
  title,
  description,
  path,
  imagePath = socialPreviewImage,
  keywords = [],
  publishedTime,
  modifiedTime,
  tags = [],
}: ArticleMetadataInput): Metadata {
  const base = createPageMetadata({
    title,
    description,
    path,
    imagePath,
    keywords,
    type: 'article',
  });

  return {
    ...base,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      ...(base.openGraph ?? {}),
      type: 'article',
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    },
  };
}

export function createCollectionPageJsonLd({
  name,
  path,
  description,
  items,
}: {
  name: string;
  path: string;
  description: string;
  items: ItemListEntry[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: toAbsoluteUrl(path),
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };
}

export function createWebPageJsonLd({
  name,
  path,
  description,
  about = [],
}: {
  name: string;
  path: string;
  description: string;
  about?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: toAbsoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: toAbsoluteUrl('/'),
    },
    ...(about.length > 0 ? { about } : {}),
    keywords: [...new Set([...entityTopics, ...about])].join(', '),
    primaryImageOfPage: toAbsoluteUrl(socialPreviewImage),
  };
}

export function createShareUrls({
  path,
  title,
  text = shareTagline,
}: {
  path: string;
  title: string;
  text?: string;
}) {
  const url = toAbsoluteUrl(path);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} - ${text}`);

  return {
    url,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}

export function createItemListJsonLd(items: ItemListEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}
