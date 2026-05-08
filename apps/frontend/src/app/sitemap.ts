import type { MetadataRoute } from 'next';
import type { AppPageId } from '../lib/page-flags';
import { isPageEnabled } from '../lib/page-flags';
import { siteUrl } from '../lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: Array<{
    path: string;
    pageId?: AppPageId;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    { path: '', pageId: 'home' as const, changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/mentors', pageId: 'mentors' as const, changeFrequency: 'monthly' as const, priority: 0.85 },
  ].filter((route) => (route.pageId ? isPageEnabled(route.pageId) : true));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return staticEntries;
}
