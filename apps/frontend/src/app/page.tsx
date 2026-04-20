import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  authorName,
  authorUrl,
  createPageMetadata,
  primarySiteSections,
  siteDescription,
  siteName,
  siteTitle,
  toAbsoluteUrl,
} from '../lib/site';

export const metadata = createPageMetadata({
  title: siteTitle,
  description: siteDescription,
  path: '/',
  absoluteTitle: true,
  keywords: [
    'student mental wellbeing platform',
    'privacy-first AI for students',
    'student support ecosystem',
    'campus resilience tools',
  ],
});

const featureHighlights = [
  {
    title: 'Privacy by Default',
    body: 'Local-first processing, minimized data movement, and explicit consent patterns keep the product grounded in trust.',
  },
  {
    title: 'Human-Centered AI',
    body: 'AI supports reflection, triage, and navigation while preserving human oversight and clear boundaries.',
  },
  {
    title: 'Accessible Experience',
    body: 'Keyboard-friendly, readable, responsive, and designed to work cleanly across phones and laptops.',
  },
  {
    title: 'Evidence-Based Pathways',
    body: 'Check-ins, safety planning, care navigation, and habit-building patterns reflect real student wellbeing programs.',
  },
];

const homeFaqs = [
  {
    question: 'What is Aether?',
    answer:
      'Aether is a student resilience ecosystem that combines private reflection, peer support, guided pathways, and transparent AI governance.',
  },
  {
    question: 'Who is Aether for?',
    answer:
      'It is designed for students, campus wellbeing teams, mentors, and researchers who need practical, privacy-aware support experiences.',
  },
  {
    question: 'What makes Aether different?',
    answer:
      'Aether emphasizes privacy-first design, accessibility, evidence-informed workflows, and clear explanations of how AI is used.',
  },
  {
    question: 'Where should someone start?',
    answer:
      'Start with the resilience pathway for a guided overview, then explore Echo Chamber, Peer-Navigator, and the blog for deeper context.',
  },
];

export default function Home() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: toAbsoluteUrl('/'),
    logo: toAbsoluteUrl('/aether-logo-icon.svg'),
    founder: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    sameAs: [authorUrl],
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: siteTitle,
    description: siteDescription,
    url: toAbsoluteUrl('/'),
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: toAbsoluteUrl('/'),
    },
    about: [
      'student resilience',
      'student mental wellbeing',
      'peer support',
      'privacy-first AI',
      'campus support tools',
    ],
    primaryImageOfPage: toAbsoluteUrl('/opengraph-image'),
  };

  const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url: toAbsoluteUrl('/'),
    description: siteDescription,
    featureList: primarySiteSections.slice(1, 5).map((section) => section.name),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: primarySiteSections.map((section, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: section.name,
      url: toAbsoluteUrl(section.path),
      description: section.description,
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="max-w-6xl w-full text-center space-y-6 md:space-y-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-indigo-100 bg-white/70 p-3 shadow-soft">
          <Image
            src="/aether-logo.svg"
            alt="Aether logo"
            width={1080}
            height={360}
            priority
            className="h-auto w-full"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-indigo-800 drop-shadow-lg leading-tight">
          Aether: Student Resiliency Ecosystem
        </h1>
        <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-2xl text-gray-700">
          A research-driven, privacy-first platform for student mental health, powered by
          multi-modal AI and peer support.
        </p>
        <p className="mx-auto max-w-4xl text-sm sm:text-base text-slate-700">
          Aether helps students stabilize, reflect, connect, and recover with guided support
          pathways, accessible interface design, transparent AI governance, and content built to be
          easy for humans and machines to understand.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap md:mt-8 md:gap-4">
          <Link
            href="/echo"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-indigo-700 sm:w-auto"
          >
            Try Echo Chamber
          </Link>
          <Link
            href="/resilience-pathway"
            className="w-full rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-teal-700 sm:w-auto"
          >
            Open Resilience Hub
          </Link>
          <Link
            href="/about"
            className="w-full rounded-lg border border-indigo-600 bg-white px-6 py-3 font-semibold text-indigo-700 shadow transition hover:bg-indigo-50 sm:w-auto"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4 md:mt-8 md:gap-4">
          {featureHighlights.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-indigo-100 bg-white/80 p-4 shadow-soft"
            >
              <h2 className="font-semibold text-indigo-800">{feature.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{feature.body}</p>
            </article>
          ))}
        </div>

        <section className="rounded-2xl border border-sky-100 bg-white/85 p-5 text-left shadow-soft md:p-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Explore the Aether ecosystem</h2>
            <p className="mt-3 text-slate-700">
              Each section is intentionally linkable, readable, and self-describing so search
              engines, AI assistants, and social previews can surface the right entry point for the
              right question.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {primarySiteSections.slice(1).map((section) => (
                <Link
                  key={section.path}
                  href={section.path}
                  className="rounded-2xl border border-slate-200 bg-white p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{section.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{section.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 text-left md:grid-cols-3">
          <article className="rounded-2xl border border-indigo-100 bg-white/85 p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Built for students</h2>
            <p className="mt-2 text-sm text-slate-700">
              The product focuses on stressful real-life moments like overwhelm, isolation,
              setbacks, and re-entry after hard weeks.
            </p>
          </article>
          <article className="rounded-2xl border border-indigo-100 bg-white/85 p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Useful for campuses</h2>
            <p className="mt-2 text-sm text-slate-700">
              Aether shows how privacy-aware digital tools can complement counselors, peer leaders,
              mentors, and broader wellbeing programs.
            </p>
          </article>
          <article className="rounded-2xl border border-indigo-100 bg-white/85 p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Clear to AI systems</h2>
            <p className="mt-2 text-sm text-slate-700">
              Canonicals, structured data, RSS, sitemap coverage, and an `llms.txt` endpoint make
              the site easier to interpret and cite accurately.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-indigo-100 bg-white/85 p-5 text-left shadow-soft md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {homeFaqs.map((faq) => (
              <article key={faq.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </section>
  );
}
