import { getAllBlogPosts, getBlogPostBySlug } from '../../lib/blog';
import { markdownToHtml } from '../../lib/markdown';
import { siteDescription, siteTitle, siteUrl } from '../../lib/site';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapCdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export async function GET() {
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
