'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NavigationLink } from '../../lib/navigation';

type SiteHeaderClientProps = {
  primaryNavigation: NavigationLink[];
  secondaryNavigation: NavigationLink[];
  trustSignals: readonly string[];
  shareTagline: string;
  siteName: string;
};

const MAX_VISIBLE_NAVIGATION_ITEMS = 4;
const explorePanelId = 'site-header-explore-panel';
const mobilePanelId = 'site-header-mobile-panel';

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function isCurrentPath(pathname: string, href: string) {
  if (isExternalHref(href)) {
    return false;
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function dedupeNavigation(links: NavigationLink[]) {
  const seenHrefs = new Set<string>();

  return links.filter((link) => {
    if (seenHrefs.has(link.href)) {
      return false;
    }

    seenHrefs.add(link.href);
    return true;
  });
}

function selectDesktopNavigation(navigation: NavigationLink[], pathname: string) {
  if (navigation.length <= MAX_VISIBLE_NAVIGATION_ITEMS) {
    return {
      visibleNavigation: navigation,
      overflowNavigation: [],
    };
  }

  const visibleNavigation = navigation.slice(0, MAX_VISIBLE_NAVIGATION_ITEMS);
  const currentNavigationItem = navigation.find((link) => isCurrentPath(pathname, link.href));

  if (currentNavigationItem && !visibleNavigation.some((link) => link.href === currentNavigationItem.href)) {
    visibleNavigation[MAX_VISIBLE_NAVIGATION_ITEMS - 1] = currentNavigationItem;
  }

  const visibleHrefs = new Set(visibleNavigation.map((link) => link.href));

  return {
    visibleNavigation,
    overflowNavigation: navigation.filter((link) => !visibleHrefs.has(link.href)),
  };
}

function HeaderNavigationLink({
  link,
  pathname,
  onNavigate,
}: {
  link: NavigationLink;
  pathname: string;
  onNavigate: () => void;
}) {
  const current = isCurrentPath(pathname, link.href);
  const className = cx(
    'inline-flex h-10 items-center rounded-[var(--theme-radius-sm)] px-3 text-sm font-extrabold no-underline transition hover:no-underline focus:no-underline',
    current
      ? 'bg-[color:var(--theme-bg-strong)] text-white shadow-sm hover:text-white focus:text-white'
      : 'text-[color:var(--theme-text-muted)] hover:bg-white hover:text-[color:var(--theme-text)] focus:bg-white focus:text-[color:var(--theme-text)]',
  );

  if (link.external || isExternalHref(link.href)) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-current={current ? 'page' : undefined}
        onClick={onNavigate}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={className}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
    >
      {link.label}
    </Link>
  );
}

function PanelNavigationLink({
  link,
  pathname,
  onNavigate,
}: {
  link: NavigationLink;
  pathname: string;
  onNavigate: () => void;
}) {
  const current = isCurrentPath(pathname, link.href);
  const className = cx(
    'theme-card-interactive block p-3 no-underline transition hover:no-underline focus:no-underline',
    current
      ? 'ring-2 ring-teal-100'
      : '',
  );
  const content = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold">{link.label}</span>
        {current ? (
          <span className="rounded-lg bg-[rgba(21,111,112,0.1)] px-2 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[color:var(--theme-primary-strong)]">
            Current
          </span>
        ) : null}
      </span>
      {link.description ? (
        <span className="mt-1 block text-xs leading-5 text-[color:var(--theme-text-muted)]">{link.description}</span>
      ) : null}
    </>
  );

  if (link.external || isExternalHref(link.href)) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

function HeaderActionLink({
  link,
  label,
  onNavigate,
}: {
  link: NavigationLink;
  label: string;
  onNavigate: () => void;
}) {
  const className =
    'hidden h-10 items-center rounded-[var(--theme-radius-sm)] border border-[color:var(--theme-primary-strong)] bg-[color:var(--theme-primary-strong)] px-4 text-sm font-extrabold text-white no-underline shadow-[var(--theme-shadow-sm)] transition hover:-translate-y-0.5 hover:bg-[#0c3f41] hover:text-white hover:no-underline focus:bg-[#0c3f41] focus:text-white focus:no-underline sm:inline-flex';

  if (link.external || isExternalHref(link.href)) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {label}
    </Link>
  );
}

export default function SiteHeaderClient({
  primaryNavigation,
  secondaryNavigation,
  trustSignals,
  shareTagline,
  siteName,
}: SiteHeaderClientProps) {
  const pathname = usePathname() || '/';
  const headerRef = useRef<HTMLElement | null>(null);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const allNavigation = useMemo(
    () => dedupeNavigation([...primaryNavigation, ...secondaryNavigation]),
    [primaryNavigation, secondaryNavigation],
  );
  const { visibleNavigation, overflowNavigation } = useMemo(
    () => selectDesktopNavigation(allNavigation, pathname),
    [allNavigation, pathname],
  );
  const ctaLink = { href: '/ask', label: 'Ask Aether', description: 'Open the guided copilot workspace.' };
  const ctaLabel = 'Ask Aether';
  const hasNavigation = allNavigation.length > 0;
  const hasOverflowNavigation = overflowNavigation.length > 0;

  const closeMenus = useCallback(() => {
    setIsExploreOpen(false);
    setIsMobileOpen(false);
  }, []);

  useEffect(() => {
    closeMenus();
  }, [closeMenus, pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current || headerRef.current.contains(event.target as Node)) {
        return;
      }

      closeMenus();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [closeMenus]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[color:var(--theme-border)] bg-[rgb(255_255_255/0.88)] shadow-[var(--theme-shadow-sm)] backdrop-blur-xl"
    >
      <div className="mx-auto flex min-w-0 max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex min-w-0 flex-none items-center gap-3 text-[color:var(--theme-text)] no-underline hover:text-[color:var(--theme-text)] hover:no-underline focus:text-[color:var(--theme-text)] focus:no-underline"
          onClick={closeMenus}
          aria-label={`${siteName} home`}
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-[var(--theme-radius-sm)] bg-white p-1 shadow-sm ring-1 ring-[color:var(--theme-border)]">
            <Image src="/aether-logo-icon.svg" alt="" width={40} height={40} priority className="h-full w-full" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-2xl font-extrabold leading-none">{siteName}</span>
            <span className="mt-1 hidden max-w-[13rem] truncate text-xs font-bold text-[color:var(--theme-text-muted)] sm:block">
              Student resilience
            </span>
          </span>
        </Link>

        {hasNavigation ? (
          <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {visibleNavigation.map((link) => (
              <HeaderNavigationLink key={link.href} link={link} pathname={pathname} onNavigate={closeMenus} />
            ))}
            {hasOverflowNavigation ? (
              <button
                type="button"
                className={cx(
                  'inline-flex h-10 items-center gap-2 rounded-[var(--theme-radius-sm)] border px-3 text-sm font-extrabold transition',
                  isExploreOpen
                    ? 'border-[color:var(--theme-bg-strong)] bg-[color:var(--theme-bg-strong)] text-white shadow-sm'
                    : 'border-[color:var(--theme-border)] bg-white text-[color:var(--theme-text-muted)] hover:border-[color:var(--theme-border-strong)] hover:text-[color:var(--theme-text)]',
                )}
                aria-expanded={isExploreOpen}
                aria-controls={explorePanelId}
                onClick={() => {
                  setIsExploreOpen((current) => !current);
                  setIsMobileOpen(false);
                }}
              >
                Explore
                <span aria-hidden="true" className="text-base leading-none">
                  {isExploreOpen ? '-' : '+'}
                </span>
              </button>
            ) : null}
          </nav>
        ) : null}

        <div className="ml-auto flex flex-none items-center gap-2 lg:ml-0">
          <HeaderActionLink link={ctaLink} label={ctaLabel} onNavigate={closeMenus} />
          {hasNavigation ? (
            <button
              type="button"
              className={cx(
                'inline-flex h-10 items-center gap-2 rounded-[var(--theme-radius-sm)] border px-3 text-sm font-extrabold transition lg:hidden',
                isMobileOpen
                  ? 'border-[color:var(--theme-bg-strong)] bg-[color:var(--theme-bg-strong)] text-white shadow-sm'
                  : 'border-[color:var(--theme-border)] bg-white text-[color:var(--theme-text)] hover:border-[color:var(--theme-border-strong)]',
              )}
              aria-expanded={isMobileOpen}
              aria-controls={mobilePanelId}
              onClick={() => {
                setIsMobileOpen((current) => !current);
                setIsExploreOpen(false);
              }}
            >
              Menu
              <span aria-hidden="true" className="text-base leading-none">
                {isMobileOpen ? '-' : '+'}
              </span>
            </button>
          ) : null}
        </div>
      </div>

      {isExploreOpen && hasOverflowNavigation ? (
        <div id={explorePanelId} className="hidden border-t border-[color:var(--theme-border)] bg-[rgb(247_251_248/0.96)] lg:block">
          <nav
            aria-label="More site navigation"
            className="mx-auto grid min-w-0 max-w-7xl gap-3 px-6 py-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {overflowNavigation.map((link) => (
              <PanelNavigationLink key={link.href} link={link} pathname={pathname} onNavigate={closeMenus} />
            ))}
          </nav>
        </div>
      ) : null}

      {isMobileOpen && hasNavigation ? (
        <div id={mobilePanelId} className="border-t border-[color:var(--theme-border)] bg-[rgb(247_251_248/0.96)] lg:hidden">
          <nav aria-label="Site navigation" className="mx-auto min-w-0 max-w-7xl px-4 py-4 md:px-6">
            <div className="grid gap-2 sm:grid-cols-2">
              {allNavigation.map((link) => (
                <PanelNavigationLink key={link.href} link={link} pathname={pathname} onNavigate={closeMenus} />
              ))}
            </div>
          </nav>
        </div>
      ) : null}

      <div className="border-t border-[color:var(--theme-border)] bg-[rgb(237_247_242/0.74)]">
        <div className="mx-auto min-w-0 max-w-7xl px-4 py-2 md:flex md:items-center md:gap-3 md:px-6">
          <p className="hidden min-w-0 flex-1 truncate text-xs font-bold text-[color:var(--theme-text-muted)] md:block">{shareTagline}</p>
          <div className="grid min-w-0 grid-cols-2 gap-1.5 md:hidden">
            {trustSignals.map((signal) => (
              <span
                key={`header-mobile-${signal}`}
                className="theme-pill min-h-0 w-full justify-center rounded-[var(--theme-radius-sm)] px-2 py-1 text-center text-[0.68rem]"
              >
                {signal}
              </span>
            ))}
          </div>
          <div className="hidden min-w-0 flex-wrap justify-end gap-1.5 md:ml-auto md:flex">
            {trustSignals.map((signal) => (
              <span
                key={`header-${signal}`}
                className="theme-pill min-h-0 rounded-[var(--theme-radius-sm)] px-2 py-1 text-[0.68rem]"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
