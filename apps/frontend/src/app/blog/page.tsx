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
    <section className="blog-index max-w-4xl space-y-8">
      <header className="blog-hero">
        <p className="blog-hero-kicker">Aether Journal</p>
        <h1>Practical Resilience Library</h1>
        <p>
          Short, evidence-informed writing for students. Built to be scannable, calming, and easy to discuss with your peers.
        </p>
      </header>

      {posts.length === 0 ? (
        <article className="blog-card">
          <h2>No posts yet</h2>
          <p className="blog-card-excerpt">Add markdown files to content/blog to publish the first article.</p>
        </article>
      ) : (
        <div className="blog-cards">
          {posts.map((post) => (
            <article key={post.slug} className="blog-card">
              <p className="blog-date">{post.date}</p>
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
