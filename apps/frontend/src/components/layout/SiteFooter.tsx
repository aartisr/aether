import Link from 'next/link';
import Image from 'next/image';
import SocialShareLinks from '../SocialShareLinks';
import InstallAether from '../pwa/InstallAether';
import type { NavigationGroup } from '../../lib/navigation';
import { getFooterNavigationForRequest, trustSignals } from '../../lib/navigation';
import { authorName, authorUrl, shareTagline, siteName } from '../../lib/site';

const pcssIiUrl = 'https://saugus.pioneercss.org';

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    'inline-flex min-h-11 items-center rounded-lg px-2 text-sm text-[color:var(--theme-text-muted)] no-underline transition hover:text-[color:var(--theme-primary-strong)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--theme-primary)] md:min-h-0 md:px-0';

  if (external || href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

type SiteFooterProps = {
  surfaceVariant?: 'glass' | 'white' | 'mint';
  accentVariant?: 'teal' | 'slate' | 'indigo';
  summaryText?: string;
  safetyTitle?: string;
  safetyNote?: string;
  copyrightText?: string;
  footerNavigation?: NavigationGroup[];
  trustSignalOverrides?: string[];
  socialSharePath?: string;
  socialShareTitle?: string;
  badgeHref?: string;
  badgeAriaLabel?: string;
  dedicationLabel?: string;
  dedicationHref?: string;
  attributionPrefix?: string;
  authorNameOverride?: string;
  authorUrlOverride?: string;
  authorLinkLabel?: string;
};

export default function SiteFooter({
  surfaceVariant,
  accentVariant,
  summaryText,
  safetyTitle,
  safetyNote,
  copyrightText,
  footerNavigation,
  trustSignalOverrides,
  socialSharePath,
  socialShareTitle,
  badgeHref,
  badgeAriaLabel,
  dedicationLabel,
  dedicationHref,
  attributionPrefix,
  authorNameOverride,
  authorUrlOverride,
  authorLinkLabel,
}: SiteFooterProps) {
  const resolvedFooterNavigation = Array.isArray(footerNavigation) ? footerNavigation : getFooterNavigationForRequest();
  const resolvedSurfaceVariant = surfaceVariant ?? 'glass';
  const resolvedAccentVariant = accentVariant ?? 'teal';
  const footerSurfaceClasses: Record<typeof resolvedSurfaceVariant, string> = {
    glass: 'mt-14 border-t border-[color:var(--theme-border)] bg-[rgb(255_255_255/0.82)]',
    white: 'mt-14 border-t border-[color:var(--theme-border)] bg-white',
    mint: 'mt-14 border-t border-emerald-100 bg-emerald-50/50',
  };
  const footerAccentClasses: Record<typeof resolvedAccentVariant, string> = {
    teal: 'relative overflow-hidden border-t border-[color:var(--theme-border)] bg-[color:var(--theme-bg-strong)] text-white',
    slate: 'relative overflow-hidden border-t border-slate-500 bg-slate-800 text-slate-50',
    indigo: 'relative overflow-hidden border-t border-indigo-500 bg-indigo-800 text-indigo-50',
  };
  const accentGlowClasses: Record<typeof resolvedAccentVariant, string> = {
    teal: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--theme-mint)] to-transparent',
    slate: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent',
    indigo: 'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent',
  };
  const currentYear = new Date().getFullYear();
  const resolvedSafetyTitle =
    typeof safetyTitle === 'string' && safetyTitle.trim().length > 0 ? safetyTitle : 'Safety Note';
  const resolvedSummaryText = typeof summaryText === 'string' && summaryText.trim().length > 0 ? summaryText : shareTagline;
  const resolvedSafetyNote =
    typeof safetyNote === 'string' && safetyNote.trim().length > 0
      ? safetyNote
      : 'Aether is a support and resilience experience, not emergency care. If there is imminent danger, contact local emergency services. In the United States, call or text 988.';
  const resolvedCopyrightText =
    typeof copyrightText === 'string' && copyrightText.trim().length > 0 ? copyrightText : 'Research-driven. Privacy-first.';
  const resolvedTrustSignals = Array.isArray(trustSignalOverrides) ? trustSignalOverrides : [...trustSignals];
  const resolvedSocialSharePath =
    typeof socialSharePath === 'string' && socialSharePath.trim().length > 0 ? socialSharePath : '/';
  const resolvedSocialShareTitle =
    typeof socialShareTitle === 'string' && socialShareTitle.trim().length > 0
      ? socialShareTitle
      : 'Aether: Student Resiliency Ecosystem';
  const resolvedBadgeHref = typeof badgeHref === 'string' && badgeHref.trim().length > 0 ? badgeHref : pcssIiUrl;
  const resolvedBadgeAriaLabel =
    typeof badgeAriaLabel === 'string' && badgeAriaLabel.trim().length > 0 ? badgeAriaLabel : 'Visit PCSS II Saugus';
  const resolvedDedicationLabel =
    typeof dedicationLabel === 'string' && dedicationLabel.trim().length > 0
      ? dedicationLabel
      : 'Dedicated to PCSS II Students and Staff.';
  const resolvedDedicationHref =
    typeof dedicationHref === 'string' && dedicationHref.trim().length > 0 ? dedicationHref : pcssIiUrl;
  const resolvedAttributionPrefix =
    typeof attributionPrefix === 'string' && attributionPrefix.trim().length > 0
      ? attributionPrefix
      : 'Aether logo artwork (c)';
  const resolvedAuthorName =
    typeof authorNameOverride === 'string' && authorNameOverride.trim().length > 0 ? authorNameOverride : authorName;
  const resolvedAuthorUrl =
    typeof authorUrlOverride === 'string' && authorUrlOverride.trim().length > 0 ? authorUrlOverride : authorUrl;
  const resolvedAuthorLinkLabel =
    typeof authorLinkLabel === 'string' && authorLinkLabel.trim().length > 0
      ? authorLinkLabel
      : resolvedAuthorName;

  return (
    <footer className={footerSurfaceClasses[resolvedSurfaceVariant]} role="contentinfo">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1.2fr_2fr] md:px-6 md:py-10 lg:py-12">
        <section aria-label="Aether summary" className="space-y-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[color:var(--theme-border)] bg-white p-1.5 shadow-sm lg:hidden">
                <Image src="/aether-logo-icon.svg" alt="" width={44} height={44} className="h-full w-full" />
              </span>
              <p className="font-display text-3xl font-extrabold text-[color:var(--theme-text)]">{siteName}</p>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--theme-text-muted)]">{resolvedSummaryText}</p>
          </div>
          <div className="rounded-[var(--theme-radius-lg)] border border-[color:var(--theme-border)] bg-[color:var(--theme-bg-soft)] p-4 shadow-[var(--theme-shadow-sm)] lg:hidden">
            <p className="theme-kicker">A calm next step</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">A private space to reflect, find guidance, or make a plan for today.</p>
            <Link
              href="/ask"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[color:var(--theme-bg-strong)] px-4 py-2.5 text-sm font-extrabold text-white no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-[color:var(--theme-primary-strong)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--theme-primary)]"
            >
              Ask Aether <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
          <div className="theme-card p-4">
            <p className="theme-kicker">{resolvedSafetyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              {resolvedSafetyNote}
            </p>
          </div>
          <SocialShareLinks path={resolvedSocialSharePath} title={resolvedSocialShareTitle} compact />
          <InstallAether />
        </section>

        <nav aria-label="Footer navigation" className="hidden gap-6 sm:grid-cols-2 lg:grid">
          {resolvedFooterNavigation.map((group) => (
            <section key={group.title}>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-[color:var(--theme-text)]">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <FooterLink href={link.href} label={link.label} external={link.external} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <nav aria-label="Footer navigation" className="space-y-2 lg:hidden">
          <p className="px-1 pb-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[color:var(--theme-text-muted)]">Explore Aether</p>
          {resolvedFooterNavigation.map((group, index) => (
            <details
              key={group.title}
              open={index === 0}
              className="group overflow-hidden rounded-[var(--theme-radius-lg)] border border-[color:var(--theme-border)] bg-white shadow-[var(--theme-shadow-sm)]"
            >
              <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-4 py-3 text-sm font-extrabold text-[color:var(--theme-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--theme-primary)]">
                {group.title}
                <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full border border-[color:var(--theme-border)] text-lg font-medium leading-none transition group-open:rotate-45 group-open:border-[color:var(--theme-primary)] group-open:text-[color:var(--theme-primary-strong)]">+</span>
              </summary>
              <ul className="grid gap-1 border-t border-[color:var(--theme-border)] bg-[color:var(--theme-bg-soft)] px-2 py-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <FooterLink href={link.href} label={link.label} external={link.external} />
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </div>

      <div className={footerAccentClasses[resolvedAccentVariant]}>
        <div aria-hidden="true" className={accentGlowClasses[resolvedAccentVariant]} />
        <div className="relative mx-auto grid min-w-0 max-w-7xl gap-5 px-4 py-6 text-xs md:grid-cols-[minmax(0,1.4fr)_auto] md:items-center md:px-6 md:py-5">
          <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <a
              href={resolvedBadgeHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={resolvedBadgeAriaLabel}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white p-1.5 shadow-[0_18px_45px_rgba(21,111,112,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(21,111,112,0.26)]"
            >
              <Image
                src="/pcss-ii-logo.jpg"
                alt="PCSS II"
                width={220}
                height={229}
                className="h-full w-full rounded-xl object-contain"
                priority={false}
              />
            </a>
            <div className="min-w-0">
              <p className="font-semibold text-white">&copy; {currentYear} {siteName}. {resolvedCopyrightText}</p>
              <p className="mt-1 max-w-2xl leading-5 text-slate-300">
                {resolvedAttributionPrefix} {currentYear} {resolvedAuthorName}.{' '}
                <a
                  href={resolvedDedicationHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-100 underline decoration-sky-300/50 underline-offset-4 transition hover:text-white hover:decoration-white"
                >
                  {resolvedDedicationLabel}
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 text-center md:items-end md:text-right">
            <div className="flex flex-wrap justify-center gap-2 md:justify-end">
              {resolvedTrustSignals.map((signal) => (
                <span key={`footer-${signal}`} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-emerald-50">
                  {signal}
                </span>
              ))}
            </div>
            <a href={resolvedAuthorUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-100 no-underline hover:underline">
              {resolvedAuthorLinkLabel}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
