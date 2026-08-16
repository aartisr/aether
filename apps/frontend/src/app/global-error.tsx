'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { track } from '../lib/analytics';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    track('application_error', { digest: error.digest ?? 'unknown' });
  }, [error.digest]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[color:var(--theme-bg-soft)] text-slate-950 px-4">
        <section className="max-w-xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950">Something went wrong</h1>
          <p className="mt-3 text-slate-700">
            We could not render this page. Please try again.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-3 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900 transition"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-3 bg-white border border-emerald-700 text-emerald-900 rounded-lg font-semibold hover:bg-emerald-50 transition"
            >
              Home
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
