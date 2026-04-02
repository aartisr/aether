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
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <Link href="/blog" className="text-sm text-indigo-700 no-underline hover:underline">
          Back to blog
        </Link>
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-700">{post.date}</p>
        <h1 className="text-3xl font-bold text-indigo-900 md:text-4xl">{post.title}</h1>
        <p className="text-gray-700">{post.excerpt}</p>
      </header>

      <section
        className="prose prose-indigo max-w-none rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-soft"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <section className="space-y-3 rounded-2xl border border-indigo-100 bg-white/90 p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-indigo-900">Discussion</h2>
        <p className="text-sm text-gray-600">
          Comments are powered by Giscus and synced with GitHub Discussions.
        </p>
        <GiscusComments />
      </section>
    </article>
  );
}
