import { getAllBlogPosts, getBlogPostBySlug } from '../../lib/blog';
import { isPageEnabled } from '../../lib/page-flags';
import { markdownToHtml } from '../../lib/markdown';
import { siteDescription, siteTitle, siteUrl } from '../../lib/site';
import { escapeXml, wrapCdata } from '../../lib/xml';

export const revalidate = 3600;

export async function GET() {
  if (!isPageEnabled('blog')) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const posts = await getAllBlogPosts();
  const enrichedPosts = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      fullPost: await getBlogPostBySlug(post.slug),
    })),
  );

  const items = enrichedPosts
    .map(({ fullPost, ...post }) => {
      const link = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.date);
      const safeDate = Number.isNaN(pubDate.getTime()) ? new Date() : pubDate;
      const html = fullPost ? markdownToHtml(fullPost.content) : '';

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid>${escapeXml(link)}</guid>
          <description>${escapeXml(post.excerpt)}</description>
          <pubDate>${safeDate.toUTCString()}</pubDate>
          ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}
          ${html ? `<content:encoded>${wrapCdata(html)}</content:encoded>` : ''}
        </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>${escapeXml(siteTitle)}</title>
        <link>${escapeXml(siteUrl)}</link>
        <description>${escapeXml(siteDescription)}</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <image>
          <url>${escapeXml(`${siteUrl}/opengraph-image`)}</url>
          <title>${escapeXml(siteTitle)}</title>
          <link>${escapeXml(siteUrl)}</link>
        </image>
        <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
