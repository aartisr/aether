import './globals.css';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata, Viewport } from 'next';
import {
  authorName,
  authorUrl,
  organizationSameAs,
  siteDescription,
  siteKeywords,
  siteName,
  siteTitle,
  siteUrl,
  socialPreviewImage,
  toAbsoluteUrl,
} from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: siteKeywords,
  authors: [{ name: authorName, url: authorUrl }],
  creator: authorName,
  publisher: 'Aether',
  category: 'Health Technology',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: siteTitle,
    description: siteDescription,
    siteName,
    locale: 'en_US',
    images: [
      {
        url: socialPreviewImage,
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
    images: [socialPreviewImage],
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
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: 'en',
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: toAbsoluteUrl('/aether-logo-icon.svg'),
    },
  };

  return (
    <html lang="en">
      <body className="min-h-screen font-sans bg-background-soft text-gray-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-indigo-700 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <header className="w-full py-3 px-4 md:py-4 md:px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3 bg-surface/80 shadow-soft sticky top-0 z-50 rounded-b-2xl backdrop-blur-md" role="banner">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Aether Home">
            <Image src="/aether-logo-icon.svg" alt="Aether logo" width={44} height={44} priority className="shrink-0" />
            <span className="text-2xl md:text-3xl font-extrabold text-primary-dark tracking-tight drop-shadow">Aether</span>
          </Link>
          <nav className="w-full md:w-auto flex flex-wrap gap-1.5 md:gap-3 items-center" aria-label="Main navigation">
            <Link href="/echo" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">Echo Chamber</Link>
            <Link href="/peer-navigator" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">Peer-Navigator</Link>
            <Link href="/accessibility" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">Accessibility</Link>
            <Link href="/resilience-pathway" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">Resilience Pathway</Link>
            <Link href="/privacy" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">Privacy</Link>
            <Link href="/about" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">About</Link>
            <Link href="/blog" className="px-3 py-1.5 rounded-xl text-sm md:text-base text-primary-dark hover:bg-accent-light focus:bg-accent-light transition">Blog</Link>
          </nav>
        </header>
        <main id="main-content" className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-8 py-6 md:py-12" tabIndex={-1}>{children}</main>
        <footer className="w-full py-6 text-center text-gray-500 text-xs bg-surface/60 mt-12 rounded-t-2xl shadow-soft" role="contentinfo">
          &copy; {new Date().getFullYear()} Aether. Research-driven. Privacy-first.
          <p className="mt-1 text-[11px] text-gray-400">Aether logo artwork (c) {new Date().getFullYear()} Aarti S Ravikumar. All rights reserved.</p>
          <p className="mt-1 text-[11px] text-gray-400">
            &quot;Dedicated to PCSS II Students&quot; -{' '}
            <a
              href={organizationSameAs[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-dark hover:text-accentDark"
            >
              Aarti S Ravikumar
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
