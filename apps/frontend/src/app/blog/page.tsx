import React from 'react';
import Link from 'next/link';
import { JsonLd } from '../../components/page/PagePrimitives';
import { getAllBlogPosts } from '../../lib/blog';
import { createCollectionPageJsonLd, createPageMetadata, siteName, toAbsoluteUrl } from '../../lib/site';
import { assertPageEnabledForRequest, getEnabledPagesForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: `Blog | ${siteName}`,
  description: 'Practical student resilience guides, product notes, and evidence-informed wellbeing writing.',
  path: '/blog',
  keywords: ['student wellbeing blog', 'resilience articles', 'mental health product notes'],
});

export default async function BlogIndexPage() {
  assertPageEnabledForRequest('blog');

  const posts = await getAllBlogPosts();
  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 4);
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 10);
  const totalReadingMinutes = posts.reduce((total, post) => total + post.readingTimeMinutes, 0);
  const keyRoutes = getEnabledPagesForRequest([
    'resilience-pathway',
    'echo',
    'peer-navigator',
    'fairness-governance',
  ]).map((page) => ({
    href: page.path,
    label: page.name,
    description: page.description,
  }));
  keyRoutes.push({
    href: '/ask',
    label: 'Ask Aether',
    description: 'Ask source-grounded questions across Aether content and product pathways.',
  });
  const collectionPageJsonLd = {
    ...createCollectionPageJsonLd({
      name: `${siteName} Blog`,
      path: '/blog',
      description: 'Practical student resilience guides and product notes from Aether.',
      items: posts.map((post) => ({
        name: post.title,
        url: toAbsoluteUrl(`/blog/${post.slug}`),
        description: post.excerpt,
      })),
    }),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Aether Journal',
        item: toAbsoluteUrl('/blog'),
      },
    ],
  };

  return (
    <section className="blog-index space-y-8">
      <JsonLd data={[collectionPageJsonLd, breadcrumbJsonLd]} idPrefix="blog-index-jsonld" />
      <header className="blog-hero">
        <div className="blog-hero-copy">
          <p className="blog-hero-kicker">Aether Journal</p>
          <h1>Practical Resilience Library</h1>
          <p>
            Short, evidence-informed guides for students who need calm next steps, not a wall of advice. Read one,
            try one action, then return when life gets loud again.
          </p>
          <div className="blog-hero-actions">
            {featuredPost ? (
              <Link href={`/blog/${featuredPost.slug}`} className="blog-button blog-button-primary">
                Start latest guide
              </Link>
            ) : null}
            <a href="/feed.xml" className="blog-button blog-button-secondary">
              Subscribe via RSS
            </a>
          </div>
        </div>
        <div className="blog-hero-stats" aria-label="Journal statistics">
          <article>
            <strong>{posts.length}</strong>
            <span>guides</span>
          </article>
          <article>
            <strong>{totalReadingMinutes}</strong>
            <span>minutes</span>
          </article>
          <article>
            <strong>{allTags.length}</strong>
            <span>themes</span>
          </article>
        </div>
      </header>

      {featuredPost ? (
        <section className="blog-featured-grid">
          <article className="blog-featured-card">
            <p className="blog-hero-kicker">Start here</p>
            <h2>
              <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
            </h2>
            <p className="blog-card-excerpt">{featuredPost.excerpt}</p>
            <div className="blog-meta-row">
              <span>{featuredPost.date}</span>
              <span>{featuredPost.readingTimeMinutes} min read</span>
            </div>
            {featuredPost.tags.length > 0 ? (
              <ul className="blog-tags">
                {featuredPost.tags.map((tag) => (
                  <li key={`featured-${tag}`}>{tag}</li>
                ))}
              </ul>
            ) : null}
          </article>

          <aside className="blog-reading-path">
            <p className="blog-hero-kicker">Reading path</p>
            <h2>Build a weekly rhythm.</h2>
            <p>
              The library is intentionally practical: stabilize, map support, manage stress, recover from setbacks, and
              plan the next season.
            </p>
            <ol>
              <li>Pick one guide.</li>
              <li>Try one action for seven days.</li>
              <li>Return with a sharper question.</li>
            </ol>
          </aside>
        </section>
      ) : null}

      <section className="blog-ecosystem">
        <div>
          <p className="blog-hero-kicker">Connect reading to action</p>
          <h2>Move from insight to support.</h2>
          <p>
            Journal articles are strongest when paired with a tool, reflection space, or source-grounded question.
          </p>
        </div>
        <div className="blog-route-grid">
          {keyRoutes.map((route) => (
            <Link key={route.href} href={route.href} className="blog-route-card">
              <span>{route.label}</span>
              <strong>{route.description}</strong>
            </Link>
          ))}
        </div>
      </section>

      {latestPosts.length > 0 ? (
        <section className="blog-latest-strip">
          <div>
            <p className="blog-hero-kicker">Recent guides</p>
            <h2>Keep the thread going.</h2>
          </div>
          <ul>
            {latestPosts.map((post) => (
              <li key={`latest-${post.slug}`}>
                <Link href={`/blog/${post.slug}`} className="no-underline">
                  <span>{post.title}</span>
                </Link>
                <p>
                  {post.date} · {post.readingTimeMinutes} min read
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {posts.length === 0 ? (
        <article className="blog-card">
          <h2>No posts yet</h2>
          <p className="blog-card-excerpt">Add markdown files to content/blog to publish the first article.</p>
        </article>
      ) : (
        <section className="blog-library-section">
          <div className="blog-section-heading">
            <p className="blog-hero-kicker">Full library</p>
            <h2>Every practical path.</h2>
            {allTags.length > 0 ? (
              <ul className="blog-tags" aria-label="Journal themes">
                {allTags.map((tag) => (
                  <li key={`theme-${tag}`}>{tag}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="blog-cards">
          {posts.map((post) => (
            <article key={post.slug} className="blog-card">
              <p className="blog-date">{post.date} · {post.readingTimeMinutes} min read</p>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              {post.tags.length > 0 ? (
                <ul className="blog-tags">
                  {post.tags.map((tag) => (
                    <li key={`${post.slug}-${tag}`}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
          </div>
        </section>
      )}
    </section>
  );
}
