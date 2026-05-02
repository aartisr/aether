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
    'inline-flex h-10 items-center rounded-lg px-3 text-sm font-extrabold no-underline transition hover:no-underline focus:no-underline',
    current
      ? 'bg-slate-950 text-white shadow-sm hover:text-white focus:text-white'
      : 'text-slate-700 hover:bg-sky-50 hover:text-slate-950 focus:bg-sky-50 focus:text-slate-950',
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
    'block rounded-lg border p-3 no-underline shadow-sm transition hover:-translate-y-0.5 hover:no-underline focus:no-underline',
    current
      ? 'border-sky-300 bg-white text-slate-950 ring-1 ring-sky-100'
      : 'border-slate-200 bg-white/90 text-slate-800 hover:border-sky-200 hover:bg-sky-50/80',
  );
  const content = (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold">{link.label}</span>
        {current ? (
          <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-sky-900">
            Current
          </span>
        ) : null}
      </span>
      {link.description ? (
        <span className="mt-1 block text-xs leading-5 text-slate-600">{link.description}</span>
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
    'hidden h-10 items-center rounded-lg bg-teal-600 px-4 text-sm font-extrabold text-white no-underline shadow-sm transition hover:bg-teal-700 hover:text-white hover:no-underline focus:bg-teal-700 focus:text-white focus:no-underline sm:inline-flex';

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
  const ctaLink = primaryNavigation[0] ?? allNavigation[0] ?? { href: '/', label: 'Home' };
  const ctaLabel = primaryNavigation.length > 0 ? 'Start here' : allNavigation.length > 0 ? 'Explore' : 'Home';
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
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-sky-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex min-w-0 flex-none items-center gap-3 text-slate-950 no-underline hover:text-slate-950 hover:no-underline focus:text-slate-950 focus:no-underline"
          onClick={closeMenus}
          aria-label={`${siteName} home`}
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-sky-100">
            <Image src="/aether-logo-icon.svg" alt="" width={40} height={40} priority className="h-full w-full" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-2xl font-extrabold leading-none">{siteName}</span>
            <span className="mt-1 hidden max-w-[13rem] truncate text-xs font-bold text-slate-500 sm:block">
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
                  'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-extrabold transition',
                  isExploreOpen
                    ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                    : 'border-sky-100 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950',
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
                'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-extrabold transition lg:hidden',
                isMobileOpen
                  ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                  : 'border-sky-100 bg-white text-slate-800 hover:border-sky-200 hover:bg-sky-50',
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
        <div id={explorePanelId} className="hidden border-t border-sky-100 bg-slate-50/95 lg:block">
          <nav
            aria-label="More site navigation"
            className="mx-auto grid w-full max-w-7xl gap-3 px-6 py-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            {overflowNavigation.map((link) => (
              <PanelNavigationLink key={link.href} link={link} pathname={pathname} onNavigate={closeMenus} />
            ))}
          </nav>
        </div>
      ) : null}

      {isMobileOpen && hasNavigation ? (
        <div id={mobilePanelId} className="border-t border-sky-100 bg-slate-50/95 lg:hidden">
          <nav aria-label="Site navigation" className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6">
            <div className="grid gap-2 sm:grid-cols-2">
              {allNavigation.map((link) => (
                <PanelNavigationLink key={link.href} link={link} pathname={pathname} onNavigate={closeMenus} />
              ))}
            </div>
          </nav>
        </div>
      ) : null}

      <div className="border-t border-sky-100 bg-gradient-to-r from-sky-50 via-white to-teal-50">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2 md:px-6">
          <p className="hidden min-w-0 flex-1 truncate text-xs font-bold text-slate-600 md:block">{shareTagline}</p>
          <div className="flex flex-wrap gap-1.5 md:ml-auto">
            {trustSignals.map((signal) => (
              <span
                key={`header-${signal}`}
                className="rounded-lg border border-white bg-white/80 px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-slate-600 shadow-sm"
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
