import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '../lib/blog';
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
    { path: '/about', pageId: 'about' as const, changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/accessibility', pageId: 'accessibility' as const, changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/echo', pageId: 'echo' as const, changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/fairness-governance', pageId: 'fairness-governance' as const, changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/peer-navigator', pageId: 'peer-navigator' as const, changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/privacy', pageId: 'privacy' as const, changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/resilience-pathway', pageId: 'resilience-pathway' as const, changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/mentors', pageId: 'mentors' as const, changeFrequency: 'monthly' as const, priority: 0.85 },
    { path: '/blog', pageId: 'blog' as const, changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/llms.txt', changeFrequency: 'weekly' as const, priority: 0.4 },
  ].filter((route) => (route.pageId ? isPageEnabled(route.pageId) : true));

  const blogPosts = isPageEnabled('blog') ? await getAllBlogPosts() : [];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const postDate = new Date(post.lastModified ?? post.date);
    const safeDate = Number.isNaN(postDate.getTime()) ? now : postDate;

    return {
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: safeDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  return [...staticEntries, ...blogEntries];
}
