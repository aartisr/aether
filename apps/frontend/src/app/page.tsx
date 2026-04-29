import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SocialShareLinks from '../components/SocialShareLinks';
import { CardGrid, JsonLd, LinkCardGrid, SurfaceCard } from '../components/page/PagePrimitives';
import { homeFaqs, homeFeatureHighlights, homeValueCards } from '../lib/home-page';
import {
  authorName,
  authorUrl,
  createItemListJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  entityTopics,
  primarySiteSections,
  shareTagline,
  siteDescription,
  siteName,
  siteTitle,
  socialProfiles,
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
    sameAs: socialProfiles,
    knowsAbout: entityTopics,
  };

  const webPageJsonLd = {
    ...createWebPageJsonLd({
      name: siteTitle,
      path: '/',
      description: siteDescription,
      about: [
        'student resilience',
        'student mental wellbeing',
        'peer support',
        'privacy-first AI',
        'campus support tools',
      ],
    }),
  };

  const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    url: toAbsoluteUrl('/'),
    description: siteDescription,
    keywords: entityTopics.join(', '),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    audience: [
      {
        '@type': 'Audience',
        audienceType: 'Students',
      },
      {
        '@type': 'Audience',
        audienceType: 'Campus wellbeing teams',
      },
      {
        '@type': 'Audience',
        audienceType: 'Mentors and researchers',
      },
    ],
    featureList: primarySiteSections.slice(1, 5).map((section) => section.name),
    screenshot: toAbsoluteUrl('/opengraph-image'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const itemListJsonLd = {
    ...createItemListJsonLd(
      primarySiteSections.map((section) => ({
        name: section.name,
        url: toAbsoluteUrl(section.path),
        description: section.description,
      })),
    ),
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
    <section className="min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <JsonLd
        idPrefix="home-jsonld"
        data={[organizationJsonLd, webPageJsonLd, softwareApplicationJsonLd, itemListJsonLd, faqJsonLd]}
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
        <h1 className="mx-auto max-w-5xl text-balance text-2xl sm:text-4xl md:text-6xl font-extrabold text-indigo-800 drop-shadow-lg leading-tight">
          Aether: Student Resiliency Ecosystem
        </h1>
        <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-2xl text-gray-700">
          A research-driven, privacy-first platform for student mental health, powered by
          multi-modal AI and peer support.
        </p>
        <p className="mx-auto max-w-4xl text-sm sm:text-base text-slate-700">
          {shareTagline} The platform makes every pathway easy for humans, search engines, and AI
          assistants to understand.
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
        <SocialShareLinks path="/" title={siteTitle} />

        <CardGrid
          items={homeFeatureHighlights}
          columns="four"
          titleLevel="h2"
          className="mt-6 text-left md:mt-8"
          itemClassName="border-indigo-100 bg-white/80 shadow-soft"
        />

        <SurfaceCard className="border-sky-100 bg-white/85 text-left">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Explore the Aether ecosystem</h2>
            <p className="mt-3 text-slate-700">
              Each section is intentionally linkable, readable, and self-describing so search
              engines, AI assistants, and social previews can surface the right entry point for the
              right question.
            </p>
            <LinkCardGrid
              className="mt-6"
              items={primarySiteSections.slice(1).map((section) => ({
                title: section.name,
                href: section.path,
                description: section.description,
              }))}
            />
          </div>
        </SurfaceCard>

        <CardGrid
          items={homeValueCards}
          columns="three"
          titleLevel="h2"
          className="text-left"
          itemClassName="rounded-2xl border-indigo-100 bg-white/85 p-5 shadow-soft"
        />

        <SurfaceCard className="border-indigo-100 bg-white/85 text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Frequently asked questions</h2>
          <CardGrid
            items={homeFaqs.map((faq) => ({ title: faq.question, description: faq.answer }))}
            columns="two"
            className="mt-5"
          />
        </SurfaceCard>
      </section>
    </section>
  );
}
