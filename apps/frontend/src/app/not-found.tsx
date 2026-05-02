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
        <article className="rounded-[2rem] border border-sky-100 bg-white/92 p-6 shadow-soft md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-700">Page Not Found</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl">
            We could not find that page.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
            The link may be old, the address may have been typed differently, or this section may not be active right now.
            The best next step is usually to return home and choose a current path.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-extrabold text-white no-underline shadow-lg shadow-slate-900/10 transition hover:bg-sky-900"
            >
              Go to homepage
            </Link>
            <Link
              href="/sitemap.xml"
              className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-extrabold text-sky-900 no-underline transition hover:bg-sky-50"
            >
              View sitemap
            </Link>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-700">Quick checks</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li>Check the address for missing letters or extra symbols.</li>
              <li>If you followed a saved link, start from the homepage to find the current page.</li>
              <li>If a page was recently turned off in admin controls, it will intentionally show this screen.</li>
            </ul>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-emerald-100 bg-white/88 p-5 shadow-soft md:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Continue From Here</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Available Aether paths</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These links reflect the pages currently enabled for this browser session.
          </p>

          <div className="mt-5 grid gap-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group rounded-2xl border border-slate-200 bg-white p-4 no-underline transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
              >
                <span className="block text-base font-extrabold text-slate-950 group-hover:text-sky-900">
                  {route.label}
                </span>
                {route.description ? (
                  <span className="mt-1 block text-sm leading-6 text-slate-600">{route.description}</span>
                ) : null}
              </Link>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold text-slate-500">Error code: 404</p>
        </aside>
      </div>
    </section>
  );
}
