import type { Metadata } from 'next';

const fallbackSiteUrl = 'https://aether.example.com';

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

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const siteName = 'Aether';
export const siteTitle = 'Aether: Student Resiliency Ecosystem';
export const siteDescription =
  'A research-driven, privacy-first student resilience platform for mental wellbeing, guided support, and practical recovery pathways.';
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
];
export const authorName = 'Aarti S Ravikumar';
export const authorUrl = 'https://aartisr.foreverlotus.com';
export const organizationSameAs = [authorUrl];
export const socialPreviewImage = '/opengraph-image';

export const primarySiteSections = [
  {
    path: '/',
    name: 'Homepage',
    description: 'Overview of the Aether student resilience ecosystem and core product pathways.',
  },
  {
    path: '/resilience-pathway',
    name: 'Resilience Pathway',
    description: 'Interactive resilience hub covering check-ins, safety planning, navigation, peer circles, and habits.',
  },
  {
    path: '/echo',
    name: 'Echo Chamber',
    description: 'Private, on-device voice reflection with transcript and sentiment mapping.',
  },
  {
    path: '/peer-navigator',
    name: 'Peer-Navigator',
    description: 'Privacy-aware peer matching demo for identity-safe student support.',
  },
  {
    path: '/fairness-governance',
    name: 'Fairness & Governance',
    description: 'Transparency layer for fairness metrics, policy, and auditability.',
  },
  {
    path: '/privacy',
    name: 'Privacy',
    description: 'Privacy-by-design approach including federated learning, minimized data exposure, and safety guardrails.',
  },
  {
    path: '/accessibility',
    name: 'Accessibility',
    description: 'Accessibility commitments, inclusive design approach, and SAFE-AI guidance.',
  },
  {
    path: '/about',
    name: 'About',
    description: 'Background, positioning, and product summary for Aether.',
  },
  {
    path: '/blog',
    name: 'Blog',
    description: 'Evidence-informed resilience articles, product notes, and practical student guidance.',
  },
] as const;

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
  absoluteTitle?: boolean;
};

export function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  imagePath = socialPreviewImage,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const mergedKeywords = Array.from(new Set([...siteKeywords, ...keywords]));

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: mergedKeywords,
    authors: [{ name: authorName, url: authorUrl }],
    creator: authorName,
    publisher: siteName,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: path,
      siteName,
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
    },
  };
}
