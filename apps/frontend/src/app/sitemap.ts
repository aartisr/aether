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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const routes = ['', '/about', '/accessibility', '/echo', '/peer-navigator', '/privacy', '/resilience-pathway'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
