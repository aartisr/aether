import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '../lib/blog';
import { siteUrl } from '../lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/accessibility', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/echo', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/fairness-governance', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/peer-navigator', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/privacy', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/resilience-pathway', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/mentors', changeFrequency: 'monthly' as const, priority: 0.85 },
    { path: '/blog', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/llms.txt', changeFrequency: 'weekly' as const, priority: 0.4 },
  ];
  const blogPosts = await getAllBlogPosts();

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
