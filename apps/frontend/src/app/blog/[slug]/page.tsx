import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GiscusComments from '../../../components/GiscusComments';
import { getAllBlogSlugs, getBlogPostBySlug, getRelatedBlogPosts } from '../../../lib/blog';
import { markdownToHtml } from '../../../lib/markdown';
import { authorName, authorUrl, siteName, toAbsoluteUrl } from '../../../lib/site';

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

  const publishedDate = new Date(post.date);
  const articleDate = Number.isNaN(publishedDate.getTime()) ? undefined : publishedDate.toISOString();
  const imagePath = `/blog/${post.slug}/opengraph-image`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: authorName, url: authorUrl }],
    creator: authorName,
    publisher: siteName,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      siteName,
      ...(articleDate ? { publishedTime: articleDate } : {}),
      tags: post.tags,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imagePath],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const html = markdownToHtml(post.content);
  const relatedPosts = await getRelatedBlogPosts(post.slug, post.tags, 3);
  const publishedDate = new Date(post.date);
  const articleDate = Number.isNaN(publishedDate.getTime()) ? new Date().toISOString() : publishedDate.toISOString();
  const modifiedDate =
    post.lastModified && !Number.isNaN(new Date(post.lastModified).getTime())
      ? new Date(post.lastModified).toISOString()
      : articleDate;
  const timeRequired = `PT${post.readingTimeMinutes}M`;

  const breadcrumbs = [
    { name: 'Home', url: toAbsoluteUrl('/') },
    { name: 'Blog', url: toAbsoluteUrl('/blog') },
    { name: post.title, url: toAbsoluteUrl(`/blog/${post.slug}`) },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const faqEntries = [
    {
      question: `How do I apply "${post.title}" in the next 24 hours?`,
      answer:
        'Start with one small action from the article, schedule it on your calendar, and share that step with a trusted peer for accountability.',
    },
    {
      question: 'What if I miss a day or fall behind?',
      answer:
        'Treat setbacks as data, not failure. Restart with the smallest next step and focus on consistency over perfection.',
    },
    {
      question: 'Can I combine this with support from mentors or counselors?',
      answer:
        'Yes. Bring your key takeaways to a mentor, counselor, or peer navigator so you can personalize the plan for your context.',
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: articleDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl('/aether-logo-icon.svg'),
      },
    },
    keywords: post.tags.join(', '),
    articleSection: post.tags,
    wordCount: post.content.split(/\s+/).filter(Boolean).length,
    timeRequired,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsoluteUrl(`/blog/${post.slug}`),
    },
    image: [toAbsoluteUrl(`/blog/${post.slug}/opengraph-image`)],
    isAccessibleForFree: true,
  };

  return (
    <article className="blog-post max-w-3xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-600">
        <Link href="/" className="no-underline hover:underline">Home</Link>
        <span>/</span>
        <Link href="/blog" className="no-underline hover:underline">Blog</Link>
        <span>/</span>
        <span className="font-medium text-slate-800">{post.title}</span>
      </nav>

      <header className="blog-post-header">
        <Link href="/blog" className="blog-post-back">
          Back to blog
        </Link>
        <p className="blog-date">{post.date} · {post.readingTimeMinutes} min read</p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </header>

      <section className="blog-article" dangerouslySetInnerHTML={{ __html: html }} />

      {relatedPosts.length > 0 ? (
        <section className="rounded-2xl border border-sky-200 bg-white/85 p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">Keep reading</h2>
          <p className="mt-2 text-sm text-slate-700">Internal links to continue your resilience pathway.</p>
          <ul className="mt-4 space-y-3">
            {relatedPosts.map((related) => (
              <li key={`related-${related.slug}`} className="rounded-xl border border-slate-200 bg-white p-3">
                <Link href={`/blog/${related.slug}`} className="no-underline">
                  <span className="font-semibold text-slate-900">{related.title}</span>
                </Link>
                <p className="mt-1 text-sm text-slate-600">{related.date} · {related.readingTimeMinutes} min read</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-indigo-200 bg-white/85 p-5 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Quick FAQ</h2>
        <div className="mt-4 space-y-4">
          {faqEntries.map((entry) => (
            <article key={entry.question} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-base font-semibold text-slate-900">{entry.question}</h3>
              <p className="mt-2 text-sm text-slate-700">{entry.answer}</p>
            </article>
          ))}
        </div>
      </section>

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
