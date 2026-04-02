import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GiscusComments from '../../../components/GiscusComments';
import { getAllBlogSlugs, getBlogPostBySlug } from '../../../lib/blog';
import { markdownToHtml } from '../../../lib/markdown';

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const html = markdownToHtml(post.content);

  return (
    <article className="blog-post max-w-3xl space-y-8">
      <header className="blog-post-header">
        <Link href="/blog" className="blog-post-back">
          Back to blog
        </Link>
        <p className="blog-date">{post.date}</p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </header>

      <section className="blog-article" dangerouslySetInnerHTML={{ __html: html }} />

      <section className="blog-discussion">
        <h2>Discussion</h2>
        <p className="blog-discussion-note">
          Share what worked for you, ask for practical tweaks, and support peers with concrete next steps.
        </p>
        <GiscusComments />
      </section>
    </article>
  );
}
