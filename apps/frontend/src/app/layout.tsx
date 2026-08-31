import './globals.css';
import '../styles/theme.css';
import '../styles/home.css';
import '../styles/assistant.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import AnalyticsProvider from '../components/AnalyticsProvider';
import FloatingAssistantLoader from '../components/assistant/FloatingAssistantLoader';
import PwaProvider from '../components/pwa/PwaProvider';
import SiteFooter from '../components/layout/SiteFooter';
import SiteHeader from '../components/layout/SiteHeader';
import SiteReturnLoop from '../components/layout/SiteReturnLoop';
import nextDynamic from 'next/dynamic';

const CmsRouteOverride = nextDynamic(() => import('../components/cms/CmsRouteOverride'), {
  ssr: false,
});

import { JsonLd } from '../components/page/PagePrimitives';
import { getGlobalShellSettings } from '../lib/cms/global-shell';
import { readCmsPageData } from '../lib/cms/storage';
import { getAllPages, isPageEnabled, isPageEnabledForRequest } from '../lib/page-flags';
import {
  authorName,
  authorUrl,
  createLanguageAlternates,
  entityTopics,
  getPrimarySiteSectionsForRequest,
  normalizedTwitterHandle,
  shareTagline,
  siteDescription,
  siteKeywords,
  siteLocale,
  siteName,
  siteTitle,
  siteUrl,
  socialProfiles,
  socialPreviewImage,
  twitterHandle,
  toAbsoluteUrl,
} from '../lib/site';

export const dynamic = 'force-dynamic';

const metadataAlternatesTypes = {
  ...(isPageEnabled('blog') ? { 'application/rss+xml': '/feed.xml' } : {}),
  'text/plain': '/llms.txt',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  manifest: '/manifest.webmanifest',
  keywords: siteKeywords,
  authors: [{ name: authorName, url: authorUrl }],
  creator: authorName,
  publisher: 'Aether',
  category: 'Health Technology',
  classification: 'Student Wellbeing Technology',
  referrer: 'strict-origin-when-cross-origin',
  alternates: {
    canonical: '/',
    languages: createLanguageAlternates('/'),
    types: metadataAlternatesTypes,
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: siteTitle,
    description: siteDescription,
    siteName,
    locale: siteLocale,
    images: [
      {
        url: toAbsoluteUrl(socialPreviewImage),
        width: 1200,
        height: 630,
        alt: 'Aether student resilience platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [toAbsoluteUrl(socialPreviewImage)],
    ...(twitterHandle
      ? {
          creator: normalizedTwitterHandle(twitterHandle),
          site: normalizedTwitterHandle(twitterHandle),
        }
      : {}),
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/aether-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/aether-logo-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/aether-192.png',
    apple: [{ url: '/icons/aether-180.png', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'default',
  },
  other: {
    'application-name': siteName,
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': siteName,
    'ai-summary': shareTagline,
    'content-language': 'en-US',
    'theme-color': '#2B5D8C',
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? {
          'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION,
        }
      : {},
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2B5D8C',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const visibleSections = getPrimarySiteSectionsForRequest();
  const enabledPaths = visibleSections.map((section) => section.path);
  const controlledPaths = getAllPages().map((page) => page.path);
  const blogEnabled = isPageEnabledForRequest('blog');
  const globalShellData = await readCmsPageData('global-shell');
  const globalShellSettings = getGlobalShellSettings(globalShellData ?? undefined);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: 'en',
    keywords: siteKeywords.join(', '),
    hasPart: visibleSections.map((section) => ({
      '@type': 'WebPage',
      name: section.name,
      url: toAbsoluteUrl(section.path),
      description: section.description,
    })),
    ...(blogEnabled
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/blog?query={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: toAbsoluteUrl('/aether-logo-icon.svg'),
      sameAs: socialProfiles,
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    founder: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    sameAs: socialProfiles,
    logo: toAbsoluteUrl('/aether-logo-icon.svg'),
    knowsAbout: entityTopics,
  };

  const navigationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: visibleSections.map((section) => section.name),
    url: visibleSections.map((section) => toAbsoluteUrl(section.path)),
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={
        {
          '--font-body': '"Manrope", "Avenir Next", "Segoe UI", sans-serif',
          '--font-display': '"Playfair Display", "Iowan Old Style", serif',
        } as React.CSSProperties
      }
    >
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <JsonLd data={[websiteJsonLd, organizationJsonLd, navigationJsonLd]} idPrefix="root-layout-jsonld" />
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-emerald-800 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <SiteHeader
          bannerText={globalShellSettings.headerBannerText}
          bannerVariant={globalShellSettings.headerBannerVariant}
          headerSurfaceVariant={globalShellSettings.headerSurfaceVariant}
          trustBarVariant={globalShellSettings.headerTrustBarVariant}
          customSiteName={globalShellSettings.headerSiteName}
          customTagline={globalShellSettings.headerTagline}
          logoHref={globalShellSettings.headerLogoHref}
          logoAlt={globalShellSettings.headerLogoAlt}
          primaryNavigation={globalShellSettings.headerPrimaryNavigation}
          secondaryNavigation={globalShellSettings.headerSecondaryNavigation}
          ctaLabel={globalShellSettings.headerCtaLabel}
          ctaHref={globalShellSettings.headerCtaHref}
          ctaDescription={globalShellSettings.headerCtaDescription}
          feedbackLabel={globalShellSettings.headerFeedbackLabel}
          explorePrimaryTitle={globalShellSettings.headerExplorePrimaryTitle}
          explorePrimaryDescription={globalShellSettings.headerExplorePrimaryDescription}
          exploreSecondaryTitle={globalShellSettings.headerExploreSecondaryTitle}
          exploreSecondaryDescription={globalShellSettings.headerExploreSecondaryDescription}
          mobilePrimaryDescription={globalShellSettings.headerMobilePrimaryDescription}
          mobileSecondaryDescription={globalShellSettings.headerMobileSecondaryDescription}
          trustSignalOverrides={globalShellSettings.headerTrustSignals}
        />
        <main
          id="main-content"
          className="theme-app-main mx-auto min-w-0 max-w-7xl px-3 pb-6 pt-3 sm:px-4 md:px-8 md:pb-10 md:pt-6"
          tabIndex={-1}
        >
          <CmsRouteOverride>{children}</CmsRouteOverride>
        </main>
        <SiteReturnLoop sections={visibleSections} />
        <SiteFooter
          surfaceVariant={globalShellSettings.footerSurfaceVariant}
          accentVariant={globalShellSettings.footerAccentVariant}
          summaryText={globalShellSettings.footerSummaryText}
          safetyTitle={globalShellSettings.footerSafetyTitle}
          safetyNote={globalShellSettings.footerSafetyNote}
          copyrightText={globalShellSettings.footerCopyrightText}
          footerNavigation={globalShellSettings.footerNavigation}
          trustSignalOverrides={globalShellSettings.footerTrustSignals}
          socialSharePath={globalShellSettings.footerSocialSharePath}
          socialShareTitle={globalShellSettings.footerSocialShareTitle}
          badgeHref={globalShellSettings.footerBadgeHref}
          badgeAriaLabel={globalShellSettings.footerBadgeAriaLabel}
          dedicationLabel={globalShellSettings.footerDedicationLabel}
          dedicationHref={globalShellSettings.footerDedicationHref}
          attributionPrefix={globalShellSettings.footerAttributionPrefix}
          authorNameOverride={globalShellSettings.footerAuthorName}
          authorUrlOverride={globalShellSettings.footerAuthorUrl}
          authorLinkLabel={globalShellSettings.footerAuthorLinkLabel}
        />
        <FloatingAssistantLoader enabledPaths={enabledPaths} controlledPaths={controlledPaths} />
        <PwaProvider />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
