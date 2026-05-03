import './globals.css';
import React from 'react';
import { Manrope, Playfair_Display } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import AnalyticsProvider from '../components/AnalyticsProvider';
import AetherAssistant from '../components/assistant/AetherAssistant';
import SiteFooter from '../components/layout/SiteFooter';
import SiteHeader from '../components/layout/SiteHeader';
import { JsonLd } from '../components/page/PagePrimitives';
import { isPageEnabled, isPageEnabledForRequest } from '../lib/page-flags';
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

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

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
    icon: '/aether-logo-icon.svg',
    shortcut: '/aether-logo-icon.svg',
    apple: '/aether-logo-icon.svg',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const visibleSections = getPrimarySiteSectionsForRequest();
  const enabledPaths = visibleSections.map((section) => section.path);
  const blogEnabled = isPageEnabledForRequest('blog');

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
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans bg-background-soft text-gray-900 antialiased">
        <JsonLd data={[websiteJsonLd, organizationJsonLd, navigationJsonLd]} idPrefix="root-layout-jsonld" />
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-indigo-700 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <SiteHeader />
        <main id="main-content" className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-8 py-6 md:py-12" tabIndex={-1}>{children}</main>
        <SiteFooter />
        <AetherAssistant enabledPaths={enabledPaths} />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
