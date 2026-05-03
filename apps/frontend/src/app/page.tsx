import React from 'react';
import Link from 'next/link';
import SocialShareLinks from '../components/SocialShareLinks';
import AetherLogoLockup from '../components/brand/AetherLogoLockup';
import { CardGrid, JsonLd, LinkCardGrid, SurfaceCard } from '../components/page/PagePrimitives';
import { homeFaqs, homeFeatureHighlights, homeValueCards } from '../lib/home-page';
import {
  authorName,
  authorUrl,
  createItemListJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  entityTopics,
  getPrimarySiteSectionsForRequest,
  shareTagline,
  siteDescription,
  siteName,
  siteTitle,
  socialProfiles,
  toAbsoluteUrl,
} from '../lib/site';
import { getEnabledPagesForRequest } from '../lib/page-flags';

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
  const visibleSections = getPrimarySiteSectionsForRequest();

  const homepageCallToActions = getEnabledPagesForRequest(['echo', 'resilience-pathway', 'about']).map((page) => {
    if (page.id === 'echo') {
      return {
        href: page.path,
        label: 'Try Echo Chamber',
        className: 'theme-button theme-button-accent w-full px-6 py-3 sm:w-auto',
      };
    }

    if (page.id === 'resilience-pathway') {
      return {
        href: page.path,
        label: 'Open Resilience Hub',
        className: 'theme-button theme-button-primary w-full px-6 py-3 sm:w-auto',
      };
    }

    return {
      href: page.path,
      label: 'Start with Aether',
      className: 'theme-button theme-button-primary w-full px-6 py-3 sm:w-auto',
    };
  });

  const returnLoopSignals = [
    {
      title: 'A calm first step',
      description: 'Aether starts with orientation, not pressure, so students can understand what support is available.',
    },
    {
      title: 'A reason to come back',
      description: 'Reflection, peer connection, and guided pathways create a rhythm that grows with each visit.',
    },
    {
      title: 'Trust in plain sight',
      description: 'Privacy, safety boundaries, and source-backed AI guidance stay visible across the experience.',
    },
  ];

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
    featureList: visibleSections.slice(1, 5).map((section) => section.name),
    screenshot: toAbsoluteUrl('/opengraph-image'),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const itemListJsonLd = {
    ...createItemListJsonLd(
      visibleSections.map((section) => ({
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
    <>
      <JsonLd
        idPrefix="home-jsonld"
        data={[organizationJsonLd, webPageJsonLd, softwareApplicationJsonLd, itemListJsonLd, faqJsonLd]}
      />
      <section className="home-page space-y-10 overflow-hidden px-3 pb-12 sm:px-4 md:space-y-12 md:px-6">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-logo-mark">
            <AetherLogoLockup className="home-logo-svg" />
          </div>
          <p className="theme-kicker">Privacy-first student resilience</p>
          <h1 className="home-hero-title">Aether</h1>
          <p className="home-hero-copy">
            A warm, evidence-informed resilience ecosystem where students can reflect, find direction, and return to
            support that feels steady.
          </p>
          <div className="mx-auto flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
            {homepageCallToActions.map((callToAction) => (
              <Link key={callToAction.href} href={callToAction.href} className={callToAction.className}>
                {callToAction.label}
              </Link>
            ))}
            <Link href="/ask" className="theme-button theme-button-secondary w-full px-6 py-3 sm:w-auto">
              Ask Aether
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['Private by default', 'Peer-aware', 'Safety bounded', 'AI-readable'].map((signal) => (
              <span key={signal} className="theme-pill">
                {signal}
              </span>
            ))}
          </div>
          <div className="home-hero-share">
            <SocialShareLinks path="/" title={siteTitle} />
          </div>
        </div>
      </section>

      <section className="home-journey-dock">
        <div className="home-journey-grid theme-shell">
          {returnLoopSignals.map((signal) => (
            <article key={signal.title} className="home-journey-card theme-card">
              <strong>{signal.title}</strong>
              <span>{signal.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="theme-shell space-y-6">
        <div className="home-section-heading">
          <p className="theme-kicker">Why it feels worth returning to</p>
          <h2>Support that has a rhythm.</h2>
          <p>
            The strongest wellbeing products give people an immediate path, a safe sense of progress, and clear trust
            markers. Aether now brings those patterns into a quieter, reusable interface system.
          </p>
        </div>
        <CardGrid items={homeFeatureHighlights} columns="four" titleLevel="h2" className="text-left" />
      </section>

      <section className="theme-shell home-return-loop">
        <SurfaceCard className="home-return-panel">
          <p className="theme-kicker">Explore Aether</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--theme-text)] md:text-4xl">
            Choose the path that matches the moment.
          </h2>
          <p className="mt-4 leading-7 text-[color:var(--theme-text-muted)]">
            {shareTagline} Navigation stays simple even when admins turn features on and off.
          </p>
          <LinkCardGrid
            className="mt-6"
            items={visibleSections.slice(1).map((section) => ({
              title: section.name,
              href: section.path,
              description: section.description,
            }))}
          />
        </SurfaceCard>

        <SurfaceCard className="home-return-panel">
          <p className="theme-kicker">Retention loop</p>
          <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--theme-text)] md:text-4xl">
            Come back for clarity, not noise.
          </h2>
          <div className="home-signal-list mt-6">
            {homeValueCards.map((card) => (
              <article key={card.title} className="home-signal-item">
                <strong>{card.title}</strong>
                <span>{card.description}</span>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="theme-shell">
        <SurfaceCard className="home-return-panel">
          <div className="home-section-heading">
            <p className="theme-kicker">Quick answers</p>
            <h2>Frequently asked questions</h2>
          </div>
          <CardGrid
            items={homeFaqs.map((faq) => ({ title: faq.question, description: faq.answer }))}
            columns="two"
            className="mt-6"
          />
        </SurfaceCard>
      </section>
      </section>
    </>
  );
}
