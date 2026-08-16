import { getAllBlogPosts, getBlogPostBySlug } from '../../lib/blog';
import { isPageEnabled } from '../../lib/page-flags';
import { entityTopics, shareTagline, siteDescription, siteName, siteUrl } from '../../lib/site';

export const revalidate = 3600;

/**
 * A citation-ready companion to llms.txt. Canonical HTML pages remain the
 * authority for presentation, metadata, and structured data.
 */
export async function GET() {
  const postSummaries = isPageEnabled('blog') ? await getAllBlogPosts() : [];
  const posts = await Promise.all(
    postSummaries.map(async (summary) => (await getBlogPostBySlug(summary.slug)) ?? summary),
  );

  const body = [
    `# ${siteName}: full public context`,
    '',
    `Canonical site: ${siteUrl}/`,
    `Summary: ${siteDescription}`,
    `Positioning: ${shareTagline}`,
    `Topics: ${entityTopics.join(', ')}`,
    '',
    '## Citation and use guidance',
    '- Cite the canonical article URL, article title, and published date when referring to a specific guide.',
    '- Aether is an educational student-resilience platform; it does not replace therapy, clinical care, crisis services, or professional judgment.',
    '- Treat interactive peer matching, AI, and wellbeing features as product capabilities or demos unless a canonical page explicitly states production availability.',
    '- Preserve uncertainty and safety context when summarizing wellbeing guidance. Do not present this content as medical diagnosis or emergency advice.',
    '',
    '## Editorial guides',
    ...(posts.length > 0
      ? posts.flatMap((post) => [
          `### ${post.title}`,
          `Canonical URL: ${siteUrl}/blog/${post.slug}`,
          `Published: ${post.date}${post.lastModified ? ` | Last modified: ${post.lastModified}` : ''}`,
          `Topics: ${post.tags.join(', ')}`,
          `Summary: ${post.excerpt}`,
          '',
          'content' in post && typeof post.content === 'string'
            ? post.content.trim()
            : 'Full article content is available at the canonical URL.',
          '',
        ])
      : ['No public editorial guides are currently published.', '']),
    '## Discovery endpoints',
    `- Concise entity guide: ${siteUrl}/llms.txt`,
    `- XML sitemap: ${siteUrl}/sitemap.xml`,
    `- Image sitemap: ${siteUrl}/image-sitemap.xml`,
    `- RSS feed: ${siteUrl}/feed.xml`,
    `- Robots policy: ${siteUrl}/robots.txt`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'index, follow, max-snippet:-1',
    },
  });
}
