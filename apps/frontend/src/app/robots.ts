import type { MetadataRoute } from 'next';

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

export default function robots(): MetadataRoute.Robots {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
