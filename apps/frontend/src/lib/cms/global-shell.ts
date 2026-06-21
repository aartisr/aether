import type { Data } from '@puckeditor/core';

export type GlobalShellNavigationLink = {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
};

export type GlobalShellNavigationGroup = {
  title: string;
  links: GlobalShellNavigationLink[];
};

export type GlobalShellSettings = {
  headerBannerText?: string;
  headerBannerVariant?: 'emerald' | 'sky' | 'slate' | 'amber';
  headerSurfaceVariant?: 'glass' | 'solid' | 'calm';
  headerTrustBarVariant?: 'mint' | 'slate' | 'sky';
  headerSiteName?: string;
  headerTagline?: string;
  headerLogoHref?: string;
  headerLogoAlt?: string;
  headerPrimaryNavigation?: GlobalShellNavigationLink[];
  headerSecondaryNavigation?: GlobalShellNavigationLink[];
  headerCtaLabel?: string;
  headerCtaHref?: string;
  headerCtaDescription?: string;
  headerFeedbackLabel?: string;
  headerExplorePrimaryTitle?: string;
  headerExplorePrimaryDescription?: string;
  headerExploreSecondaryTitle?: string;
  headerExploreSecondaryDescription?: string;
  headerMobilePrimaryDescription?: string;
  headerMobileSecondaryDescription?: string;
  headerTrustSignals?: string[];
  footerSummaryText: string;
  footerSurfaceVariant?: 'glass' | 'white' | 'mint';
  footerAccentVariant?: 'teal' | 'slate' | 'indigo';
  footerSafetyTitle?: string;
  footerSafetyNote: string;
  footerCopyrightText: string;
  footerNavigation?: GlobalShellNavigationGroup[];
  footerTrustSignals?: string[];
  footerSocialSharePath?: string;
  footerSocialShareTitle?: string;
  footerBadgeHref?: string;
  footerBadgeAriaLabel?: string;
  footerDedicationLabel?: string;
  footerDedicationHref?: string;
  footerAttributionPrefix?: string;
  footerAuthorName?: string;
  footerAuthorUrl?: string;
  footerAuthorLinkLabel?: string;
};

export const defaultGlobalShellSettings: GlobalShellSettings = {
  headerBannerText: '',
  headerBannerVariant: 'emerald',
  headerSurfaceVariant: 'glass',
  headerTrustBarVariant: 'mint',
  footerSummaryText:
    'Aether is a student resilience ecosystem designed to support reflection, navigation, and safer next steps.',
  footerSurfaceVariant: 'glass',
  footerAccentVariant: 'teal',
  footerSafetyTitle: 'Safety Note',
  footerSafetyNote:
    'Aether is a support and resilience experience, not emergency care. If there is imminent danger, contact local emergency services. In the United States, call or text 988.',
  footerCopyrightText: 'Research-driven. Privacy-first.',
  footerSocialSharePath: '/',
  footerSocialShareTitle: 'Aether: Student Resiliency Ecosystem',
  footerBadgeHref: 'https://saugus.pioneercss.org',
  footerBadgeAriaLabel: 'Visit PCSS II Saugus',
  footerDedicationLabel: 'Dedicated to PCSS II Students and Staff.',
  footerDedicationHref: 'https://saugus.pioneercss.org',
  footerAttributionPrefix: 'Aether logo artwork (c)',
};

function toOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

function toHeaderBannerVariant(value: unknown): GlobalShellSettings['headerBannerVariant'] {
  const candidate = toOptionalText(value);
  if (candidate === 'emerald' || candidate === 'sky' || candidate === 'slate' || candidate === 'amber') {
    return candidate;
  }

  return undefined;
}

function toHeaderSurfaceVariant(value: unknown): GlobalShellSettings['headerSurfaceVariant'] {
  const candidate = toOptionalText(value);
  if (candidate === 'glass' || candidate === 'solid' || candidate === 'calm') {
    return candidate;
  }

  return undefined;
}

function toHeaderTrustBarVariant(value: unknown): GlobalShellSettings['headerTrustBarVariant'] {
  const candidate = toOptionalText(value);
  if (candidate === 'mint' || candidate === 'slate' || candidate === 'sky') {
    return candidate;
  }

  return undefined;
}

function toFooterSurfaceVariant(value: unknown): GlobalShellSettings['footerSurfaceVariant'] {
  const candidate = toOptionalText(value);
  if (candidate === 'glass' || candidate === 'white' || candidate === 'mint') {
    return candidate;
  }

  return undefined;
}

function toFooterAccentVariant(value: unknown): GlobalShellSettings['footerAccentVariant'] {
  const candidate = toOptionalText(value);
  if (candidate === 'teal' || candidate === 'slate' || candidate === 'indigo') {
    return candidate;
  }

  return undefined;
}

function toStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (typeof item?.value === 'string') {
        return item.value.trim();
      }

      return '';
    })
    .filter((item) => item.length > 0);

  return items;
}

function toNavigationLinks(value: unknown): GlobalShellNavigationLink[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const links: GlobalShellNavigationLink[] = [];

  for (const item of value) {
      const href = toOptionalText(item?.href);
      const label = toOptionalText(item?.label);

      if (!href || !label) {
        continue;
      }

      links.push({
        href,
        label,
        description: toOptionalText(item?.description),
        external: toOptionalBoolean(item?.external),
      });
    }

  return links;
}

function toNavigationGroups(value: unknown): GlobalShellNavigationGroup[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const grouped = new Map<string, GlobalShellNavigationLink[]>();

  for (const item of value) {
    const title = toOptionalText(item?.groupTitle) ?? 'General';
    const href = toOptionalText(item?.href);
    const label = toOptionalText(item?.label);

    if (!href || !label) {
      continue;
    }

    const link: GlobalShellNavigationLink = {
      href,
      label,
      description: toOptionalText(item?.description),
      external: toOptionalBoolean(item?.external),
    };

    const existing = grouped.get(title) ?? [];
    existing.push(link);
    grouped.set(title, existing);
  }

  const groups = Array.from(grouped.entries()).map(([title, links]) => ({ title, links }));
  return groups;
}

export function getGlobalShellSettings(data?: Data): GlobalShellSettings {
  if (!data || !Array.isArray(data.content)) {
    return defaultGlobalShellSettings;
  }

  let headerBannerText = defaultGlobalShellSettings.headerBannerText;
  let headerBannerVariant = defaultGlobalShellSettings.headerBannerVariant;
  let headerSurfaceVariant = defaultGlobalShellSettings.headerSurfaceVariant;
  let headerTrustBarVariant = defaultGlobalShellSettings.headerTrustBarVariant;
  let headerSiteName: string | undefined;
  let headerTagline: string | undefined;
  let headerLogoHref: string | undefined;
  let headerLogoAlt: string | undefined;
  let headerPrimaryNavigation: GlobalShellNavigationLink[] | undefined;
  let headerSecondaryNavigation: GlobalShellNavigationLink[] | undefined;
  let headerCtaLabel: string | undefined;
  let headerCtaHref: string | undefined;
  let headerCtaDescription: string | undefined;
  let headerFeedbackLabel: string | undefined;
  let headerExplorePrimaryTitle: string | undefined;
  let headerExplorePrimaryDescription: string | undefined;
  let headerExploreSecondaryTitle: string | undefined;
  let headerExploreSecondaryDescription: string | undefined;
  let headerMobilePrimaryDescription: string | undefined;
  let headerMobileSecondaryDescription: string | undefined;
  let headerTrustSignals: string[] | undefined;
  let footerSummaryText = defaultGlobalShellSettings.footerSummaryText;
  let footerSurfaceVariant = defaultGlobalShellSettings.footerSurfaceVariant;
  let footerAccentVariant = defaultGlobalShellSettings.footerAccentVariant;
  let footerSafetyTitle = defaultGlobalShellSettings.footerSafetyTitle;
  let footerSafetyNote = defaultGlobalShellSettings.footerSafetyNote;
  let footerCopyrightText = defaultGlobalShellSettings.footerCopyrightText;
  let footerNavigation: GlobalShellNavigationGroup[] | undefined;
  let footerTrustSignals: string[] | undefined;
  let footerSocialSharePath = defaultGlobalShellSettings.footerSocialSharePath;
  let footerSocialShareTitle = defaultGlobalShellSettings.footerSocialShareTitle;
  let footerBadgeHref = defaultGlobalShellSettings.footerBadgeHref;
  let footerBadgeAriaLabel = defaultGlobalShellSettings.footerBadgeAriaLabel;
  let footerDedicationLabel = defaultGlobalShellSettings.footerDedicationLabel;
  let footerDedicationHref = defaultGlobalShellSettings.footerDedicationHref;
  let footerAttributionPrefix = defaultGlobalShellSettings.footerAttributionPrefix;
  let footerAuthorName: string | undefined;
  let footerAuthorUrl: string | undefined;
  let footerAuthorLinkLabel: string | undefined;

  for (const block of data.content) {
    const props = (block?.props ?? {}) as Record<string, unknown>;

    if (block?.type === 'GlobalHeaderBlock') {
      headerBannerText = toOptionalText(props.bannerText) ?? headerBannerText;
      headerBannerVariant = toHeaderBannerVariant(props.bannerVariant) ?? headerBannerVariant;
      headerSurfaceVariant = toHeaderSurfaceVariant(props.surfaceVariant) ?? headerSurfaceVariant;
      headerTrustBarVariant = toHeaderTrustBarVariant(props.trustBarVariant) ?? headerTrustBarVariant;
      headerSiteName = toOptionalText(props.siteName) ?? headerSiteName;
      headerTagline = toOptionalText(props.tagline) ?? headerTagline;
      headerLogoHref = toOptionalText(props.logoHref) ?? headerLogoHref;
      headerLogoAlt = toOptionalText(props.logoAlt) ?? headerLogoAlt;
      headerPrimaryNavigation = toNavigationLinks(props.primaryNavigation) ?? headerPrimaryNavigation;
      headerSecondaryNavigation = toNavigationLinks(props.secondaryNavigation) ?? headerSecondaryNavigation;
      headerCtaLabel = toOptionalText(props.ctaLabel) ?? headerCtaLabel;
      headerCtaHref = toOptionalText(props.ctaHref) ?? headerCtaHref;
      headerCtaDescription = toOptionalText(props.ctaDescription) ?? headerCtaDescription;
      headerFeedbackLabel = toOptionalText(props.feedbackLabel) ?? headerFeedbackLabel;
      headerExplorePrimaryTitle = toOptionalText(props.explorePrimaryTitle) ?? headerExplorePrimaryTitle;
      headerExplorePrimaryDescription =
        toOptionalText(props.explorePrimaryDescription) ?? headerExplorePrimaryDescription;
      headerExploreSecondaryTitle = toOptionalText(props.exploreSecondaryTitle) ?? headerExploreSecondaryTitle;
      headerExploreSecondaryDescription =
        toOptionalText(props.exploreSecondaryDescription) ?? headerExploreSecondaryDescription;
      headerMobilePrimaryDescription =
        toOptionalText(props.mobilePrimaryDescription) ?? headerMobilePrimaryDescription;
      headerMobileSecondaryDescription =
        toOptionalText(props.mobileSecondaryDescription) ?? headerMobileSecondaryDescription;
      headerTrustSignals = toStringList(props.trustSignals) ?? headerTrustSignals;
    }

    if (block?.type === 'GlobalFooterBlock') {
      footerSummaryText = toOptionalText(props.summaryText) ?? footerSummaryText;
      footerSurfaceVariant = toFooterSurfaceVariant(props.surfaceVariant) ?? footerSurfaceVariant;
      footerAccentVariant = toFooterAccentVariant(props.accentVariant) ?? footerAccentVariant;
      footerSafetyTitle = toOptionalText(props.safetyTitle) ?? footerSafetyTitle;
      footerSafetyNote = toOptionalText(props.safetyNote) ?? footerSafetyNote;
      footerCopyrightText = toOptionalText(props.copyrightText) ?? footerCopyrightText;
      footerNavigation = toNavigationGroups(props.navigationLinks) ?? footerNavigation;
      footerTrustSignals = toStringList(props.trustSignals) ?? footerTrustSignals;
      footerSocialSharePath = toOptionalText(props.socialSharePath) ?? footerSocialSharePath;
      footerSocialShareTitle = toOptionalText(props.socialShareTitle) ?? footerSocialShareTitle;
      footerBadgeHref = toOptionalText(props.badgeHref) ?? footerBadgeHref;
      footerBadgeAriaLabel = toOptionalText(props.badgeAriaLabel) ?? footerBadgeAriaLabel;
      footerDedicationLabel = toOptionalText(props.dedicationLabel) ?? footerDedicationLabel;
      footerDedicationHref = toOptionalText(props.dedicationHref) ?? footerDedicationHref;
      footerAttributionPrefix = toOptionalText(props.attributionPrefix) ?? footerAttributionPrefix;
      footerAuthorName = toOptionalText(props.authorName) ?? footerAuthorName;
      footerAuthorUrl = toOptionalText(props.authorUrl) ?? footerAuthorUrl;
      footerAuthorLinkLabel = toOptionalText(props.authorLinkLabel) ?? footerAuthorLinkLabel;
    }
  }

  return {
    headerBannerText,
    headerBannerVariant,
    headerSurfaceVariant,
    headerTrustBarVariant,
    headerSiteName,
    headerTagline,
    headerLogoHref,
    headerLogoAlt,
    headerPrimaryNavigation,
    headerSecondaryNavigation,
    headerCtaLabel,
    headerCtaHref,
    headerCtaDescription,
    headerFeedbackLabel,
    headerExplorePrimaryTitle,
    headerExplorePrimaryDescription,
    headerExploreSecondaryTitle,
    headerExploreSecondaryDescription,
    headerMobilePrimaryDescription,
    headerMobileSecondaryDescription,
    headerTrustSignals,
    footerSummaryText,
    footerSurfaceVariant,
    footerAccentVariant,
    footerSafetyTitle,
    footerSafetyNote,
    footerCopyrightText,
    footerNavigation,
    footerTrustSignals,
    footerSocialSharePath,
    footerSocialShareTitle,
    footerBadgeHref,
    footerBadgeAriaLabel,
    footerDedicationLabel,
    footerDedicationHref,
    footerAttributionPrefix,
    footerAuthorName,
    footerAuthorUrl,
    footerAuthorLinkLabel,
  };
}
