import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllBlogPosts } from '../../lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Aether updates, research notes, and product design writing.',
};

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-700">Aether Journal</p>
        <h1 className="text-3xl font-bold text-indigo-900 md:text-4xl">Static Blog</h1>
        <p className="text-gray-700">
          Product updates, resilience research synthesis, and implementation notes from the Aether roadmap.
        </p>
      </header>

      {posts.length === 0 ? (
        <article className="rounded-2xl border border-indigo-100 bg-white/80 p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-indigo-900">No posts yet</h2>
          <p className="mt-2 text-gray-600">Add markdown files to content/blog to publish the first article.</p>
        </article>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">{post.date}</p>
              <h2 className="mt-1 text-2xl font-semibold text-indigo-900">
                <Link href={`/blog/${post.slug}`} className="no-underline hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-gray-700">{post.excerpt}</p>
              {post.tags.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={`${post.slug}-${tag}`} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {tag}
                    </li>
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
