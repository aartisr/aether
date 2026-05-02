import { notFound, redirect } from 'next/navigation';
import { getAdminSessionMaxAgeSeconds, isAdminAuthenticatedForRequest, shouldExposeAdminConsole } from '../../../lib/admin-auth';
import { createPageMetadata } from '../../../lib/site';
import {
  DEFAULT_ENABLED_PAGE_IDS,
  getAllPages,
  getRequestPageOverrides,
  isPageEnabledForRequest,
} from '../../../lib/page-flags';
import { applyPresetAction, logoutAdminAction, resetPageFlagsAction, savePageFlagsAction } from './actions';

export const metadata = createPageMetadata({
  title: 'Admin Page Controls',
  description: 'Enable or disable Aether pages at runtime using plug-and-play configuration controls.',
  path: '/admin/page-controls',
  keywords: ['admin controls', 'feature toggles', 'page configuration'],
});

export default async function AdminPageControlsPage({
  searchParams,
}: {
  searchParams?: { saved?: string; reset?: string; preset?: string; error?: string };
}) {
  if (!shouldExposeAdminConsole()) {
    notFound();
  }

  const authenticated = await isAdminAuthenticatedForRequest();
  if (!authenticated) {
    redirect('/admin/login?next=/admin/page-controls');
  }

  const pages = getAllPages();
  const configurablePages = pages.filter((page) => page.id !== 'home');
  const requestOverrides = getRequestPageOverrides();
  const usingSessionOverrides = Boolean(requestOverrides);
  const defaultPublicPageNames = DEFAULT_ENABLED_PAGE_IDS.map((pageId) => {
    if (pageId === 'home') {
      return 'Home';
    }

    return pages.find((page) => page.id === pageId)?.name;
  })
    .filter(Boolean)
    .join(', ');

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft md:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-extrabold text-slate-900">Page Controls</h1>
        <p className="text-sm leading-6 text-slate-700">
          Toggle pages on and off instantly for this browser session. Changes are saved in a cookie and applied to
          navigation and route guards without restarting the app.
        </p>
        <p className="text-sm leading-6 text-slate-700">
          Default public pages are {defaultPublicPageNames}. All other pages stay hidden until an admin enables them.
        </p>
        <p className="text-xs text-slate-500">
          Admin session TTL: {Math.floor(getAdminSessionMaxAgeSeconds() / 60)} minutes.
        </p>
      </header>

      {searchParams?.saved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Page configuration saved.
        </div>
      ) : null}
      {searchParams?.reset ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
          Runtime overrides cleared. Environment defaults are active.
        </div>
      ) : null}
      {searchParams?.preset ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800">
          Preset applied: {searchParams.preset}.
        </div>
      ) : null}
      {searchParams?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          Could not apply the selected preset.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Current Mode</h2>
        <p className="mt-2 text-sm text-slate-700">
          {usingSessionOverrides
            ? 'Runtime cookie overrides are active for this browser.'
            : 'Using default public pages plus any environment allowlist/disable-list configuration.'}
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Quick Presets</h2>
        <p className="text-sm text-slate-600">One-click profiles inspired by modern dashboard workflows.</p>
        <div className="flex flex-wrap gap-3">
          <form action={applyPresetAction}>
            <input type="hidden" name="preset" value="default" />
            <button
              type="submit"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Default Public
            </button>
          </form>
          <form action={applyPresetAction}>
            <input type="hidden" name="preset" value="all" />
            <button
              type="submit"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              All Pages
            </button>
          </form>
          <form action={applyPresetAction}>
            <input type="hidden" name="preset" value="core" />
            <button
              type="submit"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Core Journey
            </button>
          </form>
          <form action={applyPresetAction}>
            <input type="hidden" name="preset" value="journal" />
            <button
              type="submit"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Journal Mode
            </button>
          </form>
        </div>
      </section>

      <form action={savePageFlagsAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enable Pages</h2>
          <p className="mt-1 text-sm text-slate-600">
            Home always stays enabled. About and Mentors are checked by default; select any additional pages you want active.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {configurablePages.map((page) => (
            <li key={page.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="enabledPages"
                  value={page.id}
                  defaultChecked={isPageEnabledForRequest(page.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{page.name}</span>
                  <span className="block text-xs text-slate-600">{page.path}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Save Runtime Overrides
          </button>
        </div>
      </form>

      <form action={resetPageFlagsAction} className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Reset</h2>
        <p className="mt-1 text-sm text-slate-600">Clear browser overrides and revert to environment-based defaults.</p>
        <button
          type="submit"
          className="mt-4 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
        >
          Reset to Environment Defaults
        </button>
      </form>

      <form action={logoutAdminAction} className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">Session</h2>
        <p className="mt-1 text-sm text-slate-600">Sign out this browser from admin mode.</p>
        <button
          type="submit"
          className="mt-4 rounded-full border border-rose-300 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Sign Out Admin
        </button>
      </form>
    </section>
  );
}
