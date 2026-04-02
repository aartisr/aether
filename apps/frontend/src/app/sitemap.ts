import type { MetadataRoute } from 'next';
import { getAllBlogSlugs } from '../lib/blog';

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const routes = ['', '/about', '/accessibility', '/echo', '/peer-navigator', '/privacy', '/resilience-pathway', '/blog'];
  const blogSlugs = await getAllBlogSlugs();
  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
  const allRoutes = [...routes, ...blogRoutes];

  return allRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
