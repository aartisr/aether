import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'You are offline',
  description: 'Aether is waiting for a connection before loading live support resources.',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="mx-auto grid min-h-[55vh] max-w-2xl place-items-center py-10 text-center sm:py-16">
      <div className="theme-card max-w-xl p-7 sm:p-10">
        <p className="theme-kicker">Connection paused</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-[color:var(--theme-text)] sm:text-5xl">
          Take a breath. We’ll reconnect when you’re ready.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[color:var(--theme-text-muted)]">
          Aether could not reach the internet, so live resources and private tools are unavailable for now. Your current page was not saved or sent anywhere.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/" className="theme-button theme-button-primary justify-center">Try again</a>
          <Link href="/resilience-pathway" className="theme-button theme-button-secondary justify-center">Explore when connected</Link>
        </div>
      </div>
    </section>
  );
}
