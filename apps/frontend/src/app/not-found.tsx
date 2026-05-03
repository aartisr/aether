import Link from 'next/link';
import type { Metadata } from 'next';
import { getPrimaryNavigationForRequest, getSecondaryNavigationForRequest } from '../lib/navigation';
import { getPrimarySiteSectionsForRequest, siteName } from '../lib/site';

export const metadata: Metadata = {
  title: `Page Not Found | ${siteName}`,
  description: 'The page could not be found. Use the homepage or available Aether sections to continue.',
  robots: {
    index: false,
    follow: true,
  },
};

const fallbackRoutes = [
  {
    href: '/',
    label: 'Homepage',
    description: 'Return to the main Aether entry point.',
  },
];

export default function NotFound() {
  const availableNavigation = [
    ...getPrimaryNavigationForRequest(),
    ...getSecondaryNavigationForRequest(),
  ];
  const availableSections = getPrimarySiteSectionsForRequest()
    .filter((section) => section.path !== '/')
    .map((section) => ({
      href: section.path,
      label: section.name,
      description: section.description,
    }));
  const suggestedRoutes = (availableNavigation.length > 0 ? availableNavigation : availableSections).slice(0, 4);
  const routes = suggestedRoutes.length > 0 ? suggestedRoutes : fallbackRoutes;

  return (
    <section className="mx-auto flex min-h-[68vh] w-full max-w-6xl items-center px-2 py-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <article className="theme-band p-6 md:p-8">
          <p className="theme-kicker">Page Not Found</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-[color:var(--theme-text)] md:text-6xl">
            We could not find that page.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--theme-text-muted)] md:text-lg">
            The link may be old, the address may have been typed differently, or this section may not be active right now.
            The best next step is usually to return home and choose a current path.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/"
              className="theme-button theme-button-primary px-5 py-3 text-sm"
            >
              Go to homepage
            </Link>
            <Link
              href="/sitemap.xml"
              className="theme-button theme-button-secondary px-5 py-3 text-sm"
            >
              View sitemap
            </Link>
          </div>

          <div className="theme-card mt-7 p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-[color:var(--theme-text)]">Quick checks</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              <li>Check the address for missing letters or extra symbols.</li>
              <li>If you followed a saved link, start from the homepage to find the current page.</li>
              <li>If a page was recently turned off in admin controls, it will intentionally show this screen.</li>
            </ul>
          </div>
        </article>

        <aside className="theme-card p-5 md:p-6">
          <p className="theme-kicker">Continue From Here</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--theme-text)]">Available Aether paths</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">
            These links reflect the pages currently enabled for this browser session.
          </p>

          <div className="mt-5 grid gap-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="theme-card-interactive group p-4 no-underline"
              >
                <span className="block text-base font-extrabold text-[color:var(--theme-text)] group-hover:text-[color:var(--theme-primary-strong)]">
                  {route.label}
                </span>
                {route.description ? (
                  <span className="mt-1 block text-sm leading-6 text-[color:var(--theme-text-muted)]">{route.description}</span>
                ) : null}
              </Link>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold text-[color:var(--theme-text-soft)]">Error code: 404</p>
        </aside>
      </div>
    </section>
  );
}
