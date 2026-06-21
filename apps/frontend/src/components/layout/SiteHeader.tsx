import type { NavigationLink } from '../../lib/navigation';
import { getPrimaryNavigationForRequest, getSecondaryNavigationForRequest, trustSignals } from '../../lib/navigation';
import { shareTagline, siteName } from '../../lib/site';
import SiteHeaderClient from './SiteHeaderClient';

type SiteHeaderProps = {
  bannerText?: string;
  bannerVariant?: 'emerald' | 'sky' | 'slate' | 'amber';
  headerSurfaceVariant?: 'glass' | 'solid' | 'calm';
  trustBarVariant?: 'mint' | 'slate' | 'sky';
  customSiteName?: string;
  customTagline?: string;
  logoHref?: string;
  logoAlt?: string;
  primaryNavigation?: NavigationLink[];
  secondaryNavigation?: NavigationLink[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaDescription?: string;
  feedbackLabel?: string;
  explorePrimaryTitle?: string;
  explorePrimaryDescription?: string;
  exploreSecondaryTitle?: string;
  exploreSecondaryDescription?: string;
  mobilePrimaryDescription?: string;
  mobileSecondaryDescription?: string;
  trustSignalOverrides?: string[];
};

export default function SiteHeader({
  bannerText,
  bannerVariant,
  headerSurfaceVariant,
  trustBarVariant,
  customSiteName,
  customTagline,
  logoHref,
  logoAlt,
  primaryNavigation,
  secondaryNavigation,
  ctaLabel,
  ctaHref,
  ctaDescription,
  feedbackLabel,
  explorePrimaryTitle,
  explorePrimaryDescription,
  exploreSecondaryTitle,
  exploreSecondaryDescription,
  mobilePrimaryDescription,
  mobileSecondaryDescription,
  trustSignalOverrides,
}: SiteHeaderProps) {
  const resolvedPrimaryNavigation = Array.isArray(primaryNavigation)
    ? primaryNavigation
    : getPrimaryNavigationForRequest();
  const resolvedSecondaryNavigation = Array.isArray(secondaryNavigation)
    ? secondaryNavigation
    : getSecondaryNavigationForRequest();

  const resolvedBannerVariant = bannerVariant ?? 'emerald';
  const bannerClassNameByVariant: Record<typeof resolvedBannerVariant, string> = {
    emerald: 'border-b border-emerald-200 bg-emerald-50 text-emerald-900',
    sky: 'border-b border-sky-200 bg-sky-50 text-sky-900',
    slate: 'border-b border-slate-300 bg-slate-100 text-slate-900',
    amber: 'border-b border-amber-200 bg-amber-50 text-amber-900',
  };

  return (
    <>
      {bannerText ? (
        <div
          className={`px-4 py-2 text-center text-xs font-semibold md:px-6 ${bannerClassNameByVariant[resolvedBannerVariant]}`}
        >
          {bannerText}
        </div>
      ) : null}
      <SiteHeaderClient
        primaryNavigation={resolvedPrimaryNavigation}
        secondaryNavigation={resolvedSecondaryNavigation}
        trustSignals={Array.isArray(trustSignalOverrides) ? trustSignalOverrides : [...trustSignals]}
        shareTagline={customTagline ?? shareTagline}
        siteName={customSiteName ?? siteName}
        logoHref={logoHref}
        logoAlt={logoAlt}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        ctaDescription={ctaDescription}
        feedbackLabel={feedbackLabel}
        explorePrimaryTitle={explorePrimaryTitle}
        explorePrimaryDescription={explorePrimaryDescription}
        exploreSecondaryTitle={exploreSecondaryTitle}
        exploreSecondaryDescription={exploreSecondaryDescription}
        mobilePrimaryDescription={mobilePrimaryDescription}
        mobileSecondaryDescription={mobileSecondaryDescription}
        headerSurfaceVariant={headerSurfaceVariant}
        trustBarVariant={trustBarVariant}
      />
    </>
  );
}
