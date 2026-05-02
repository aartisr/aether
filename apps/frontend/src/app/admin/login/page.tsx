import { notFound, redirect } from 'next/navigation';
import { createPageMetadata } from '../../../lib/site';
import {
  getAdminSessionMaxAgeSeconds,
  isAdminAccessConfigured,
  isAdminAuthenticatedForRequest,
  shouldExposeAdminConsole,
} from '../../../lib/admin-auth';
import { loginAdminAction } from './actions';

export const metadata = createPageMetadata({
  title: 'Admin Sign In',
  description: 'Authenticate to access Aether administrative controls.',
  path: '/admin/login',
  keywords: ['admin authentication', 'admin login'],
});

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/admin/page-controls';
  }

  if (nextPath.startsWith('/admin/login')) {
    return '/admin/page-controls';
  }

  return nextPath;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; logout?: string; next?: string };
}) {
  if (!shouldExposeAdminConsole()) {
    notFound();
  }

  if (!isAdminAccessConfigured()) {
    notFound();
  }

  const isAuthenticated = await isAdminAuthenticatedForRequest();
  const nextPath = sanitizeNextPath(searchParams?.next);

  if (isAuthenticated) {
    redirect(nextPath);
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft md:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Aether Admin</p>
        <h1 className="text-3xl font-extrabold text-slate-900">Secure Sign In</h1>
        <p className="text-sm leading-6 text-slate-700">
          Enter your admin access key to manage page toggles. Sessions are scoped to admin routes and expire automatically.
        </p>
      </header>

      {searchParams?.logout ? (
        <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
          Signed out of admin mode.
        </div>
      ) : null}
      {searchParams?.error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          Sign in failed. Check your access key and try again.
        </div>
      ) : null}

      <form action={loginAdminAction} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <label htmlFor="accessKey" className="block text-sm font-semibold text-slate-800">
            Admin access key
          </label>
          <input
            id="accessKey"
            name="accessKey"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 transition focus:ring"
            placeholder="Enter access key"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Continue to Admin Controls
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Session duration: {Math.floor(getAdminSessionMaxAgeSeconds() / 60)} minutes.
      </p>
    </section>
  );
}
