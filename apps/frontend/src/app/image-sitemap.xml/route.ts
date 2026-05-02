import { getAllBlogPosts } from '../../lib/blog';
import { isPageEnabled } from '../../lib/page-flags';
import { primarySiteSections, siteName, siteUrl } from '../../lib/site';
import { escapeXml } from '../../lib/xml';

export const revalidate = 3600;

export async function GET() {
  const posts = isPageEnabled('blog') ? await getAllBlogPosts() : [];
  const staticEntries = primarySiteSections.map((section) => ({
    loc: `${siteUrl}${section.path}`,
    image: `${siteUrl}/opengraph-image`,
    title: `${siteName} - ${section.name}`,
  }));
  const blogEntries = posts.map((post) => ({
    loc: `${siteUrl}/blog/${post.slug}`,
    image: `${siteUrl}/blog/${post.slug}/opengraph-image`,
    title: post.title,
  }));

  const entries = [...staticEntries, ...blogEntries]
    .map(
      (entry) => `<url>
  <loc>${escapeXml(entry.loc)}</loc>
  <image:image>
    <image:loc>${escapeXml(entry.image)}</image:loc>
    <image:title>${escapeXml(entry.title)}</image:title>
  </image:image>
</url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
