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
  const latestPosts = posts.slice(0, 3);
  const keyRoutes = getEnabledPagesForRequest([
    'resilience-pathway',
    'peer-navigator',
    'echo',
    'fairness-governance',
  ]).map((page) => ({
    href: page.path,
    label: page.name,
  }));
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

  return (
    <section className="blog-index max-w-4xl space-y-8">
      <JsonLd data={collectionPageJsonLd} idPrefix="blog-index-jsonld" />
      <header className="blog-hero">
        <p className="blog-hero-kicker">Aether Journal</p>
        <h1>Practical Resilience Library</h1>
        <p>
          Short, evidence-informed writing for students. Built to be scannable, calming, and easy to discuss with your peers.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Subscribe via <a href="/feed.xml" className="underline">RSS</a> or explore the latest internal links below.
        </p>
      </header>

      <section className="rounded-2xl border border-sky-200 bg-white/80 p-5 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Explore the Aether ecosystem</h2>
        <p className="mt-2 text-sm text-slate-700">
          Jump from the library into guided tools and pathways to keep momentum after each read.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {keyRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-800 no-underline hover:bg-sky-200"
            >
              {route.label}
            </Link>
          ))}
        </div>
      </section>

      {latestPosts.length > 0 ? (
        <section className="rounded-2xl border border-indigo-200 bg-white/80 p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Start with these essentials</h2>
          <ul className="mt-4 space-y-3">
            {latestPosts.map((post) => (
              <li key={`latest-${post.slug}`} className="rounded-xl border border-slate-200 bg-white p-3">
                <Link href={`/blog/${post.slug}`} className="no-underline">
                  <span className="text-base font-semibold text-slate-900">{post.title}</span>
                </Link>
                <p className="mt-1 text-sm text-slate-600">
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
      )}
    </section>
  );
}
