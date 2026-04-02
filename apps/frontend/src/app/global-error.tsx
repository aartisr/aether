'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background-soft text-gray-900 px-4">
        <section className="max-w-xl text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-800">Something went wrong</h1>
          <p className="mt-3 text-gray-600">
            We could not render this page. Please try again.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-3 bg-white border border-indigo-600 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Home
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
