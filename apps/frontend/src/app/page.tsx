import React from 'react';
import Link from 'next/link';
import AetherLogoLockup from '../components/brand/AetherLogoLockup';
import { CardGrid, JsonLd } from '../components/page/PagePrimitives';
import {
  authorName,
  authorUrl,
  createItemListJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  entityTopics,
  getPrimarySiteSectionsForRequest,
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
  const visibleSections = getPrimarySiteSectionsForRequest();

  const proofPoints = [
    { value: 'Private', label: 'Reflection patterns are designed around minimized exposure.' },
    { value: 'Guided', label: 'The first action is always clearer than the surrounding stress.' },
    { value: 'Safe', label: 'Boundaries, crisis notes, and trust cues stay visible.' },
  ];
  const firstVisitActions = [
    {
      title: 'I need a calmer moment',
      description: 'Reflect privately and choose one grounding cue without explaining everything first.',
      href: '/echo',
      label: 'Start a private reflection',
    },
    {
      title: 'I want one practical next step',
      description: 'Make a simple check-in, then choose a plan, resource, peer path, or habit.',
      href: '/resilience-pathway',
      label: 'Choose a next step',
    },
    {
      title: 'I am not sure where to begin',
      description: 'Ask a short question and receive a source-grounded answer with a clear handoff.',
      href: '/ask',
      label: 'Ask a question',
    },
  ];
  const availableFirstVisitActions = firstVisitActions.filter(
    (action) => action.href === '/ask' || visibleSections.some((section) => section.path === action.href),
  );

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


  return (
    <>
      <JsonLd
        idPrefix="home-jsonld"
        data={[organizationJsonLd, webPageJsonLd, softwareApplicationJsonLd, itemListJsonLd]}
      />
      <section className="home-page space-y-10 overflow-hidden px-3 pb-12 sm:px-4 md:space-y-12 md:px-6">
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy-block">
            <p className="theme-kicker">Privacy-first student resilience</p>
            <h1 className="home-hero-title">Aether</h1>
            <p className="home-hero-copy">
              A quieter place to pause, reflect, and find your next steady step.
            </p>
            <p className="home-hero-reassurance">There is no perfect way to begin. Take this one moment at a time.</p>
            <div className="home-hero-actions">
              <Link href="#first-step" className="home-hero-action-primary theme-button theme-button-primary px-6 py-3">
                Find one next step
              </Link>
              <Link href="/ask" className="home-hero-action-secondary theme-button theme-button-secondary px-6 py-3">
                I have a question
              </Link>
            </div>
            <div className="home-hero-signals">
              {['Private by default', 'Peer-aware', 'Safety bounded'].map((signal) => (
                <span key={signal} className="theme-pill">
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <aside className="home-hero-compass" aria-label="Aether resilience compass">
            <div className="home-logo-mark">
              <AetherLogoLockup className="home-logo-svg" />
            </div>
            <div className="home-proof-grid">
              {proofPoints.map((point) => (
                <article key={point.value} className="home-proof-card">
                  <strong>{point.value}</strong>
                  <span>{point.label}</span>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="first-step" className="theme-shell scroll-mt-24 space-y-6">
        <div className="home-section-heading">
          <p className="theme-kicker">A gentle place to begin</p>
          <h2>What would help most right now?</h2>
          <p>
            You do not need to name everything perfectly. Choose the closest option, take one focused step, and come
            back whenever you need to.
          </p>
        </div>
        <CardGrid
          items={availableFirstVisitActions.map((action) => ({
            title: action.title,
            description: action.description,
            href: action.href,
            hrefLabel: action.label,
          }))}
          columns="three"
          className="home-first-step-grid text-left"
          itemClassName="home-first-step-card"
        />
      </section>

      </section>
    </>
  );
}
