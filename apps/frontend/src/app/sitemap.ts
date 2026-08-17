import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '../lib/blog';
import type { AppPageId } from '../lib/page-flags';
import { isPageEnabled } from '../lib/page-flags';
import { siteUrl } from '../lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    { path: '/feedback', pageId: 'feedback' as const, changeFrequency: 'monthly' as const, priority: 0.45 },
    { path: '/ask', changeFrequency: 'weekly' as const, priority: 0.75 },
  ].filter((route) => (route.pageId ? isPageEnabled(route.pageId) : true));

  const blogPosts = isPageEnabled('blog') ? await getAllBlogPosts() : [];

  // Do not manufacture a "last modified" timestamp at request time. Doing so tells
  // crawlers that every page changed on every sitemap refresh, which wastes crawl
  // budget and obscures the genuinely updated editorial content below.
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const postDate = new Date(post.lastModified ?? post.date);

    return {
      url: `${siteUrl}/blog/${post.slug}`,
      // A malformed content date is better omitted than replaced with "now".
      ...(Number.isNaN(postDate.getTime()) ? {} : { lastModified: postDate }),
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  return [...staticEntries, ...blogEntries];
}
