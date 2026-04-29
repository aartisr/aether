import Image from 'next/image';
import Link from 'next/link';
import { primaryNavigation, secondaryNavigation, trustSignals } from '../../lib/navigation';
import { shareTagline, siteName } from '../../lib/site';

function NavLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        className ??
        'rounded-full px-3 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:bg-sky-50 hover:text-sky-900'
      }
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/92 shadow-[0_12px_40px_-32px_rgba(15,34,66,0.8)] backdrop-blur-xl" role="banner">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-3 no-underline" aria-label={`${siteName} home`}>
          <Image src="/aether-logo-icon.svg" alt="" width={40} height={40} priority className="shrink-0" />
          <span className="min-w-0">
            <span className="block font-display text-2xl font-extrabold leading-none text-slate-950">{siteName}</span>
            <span className="hidden max-w-[19rem] truncate text-xs font-semibold text-slate-500 sm:block">
              Student resiliency ecosystem
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
          <details className="group relative">
            <summary className="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-900">
              More
            </summary>
            <div className="absolute right-0 top-11 w-[24rem] rounded-2xl border border-sky-100 bg-white p-3 text-left shadow-2xl">
              <div className="grid gap-2">
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl p-3 no-underline transition hover:bg-sky-50"
                  >
                    <span className="block text-sm font-bold text-slate-900">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">{item.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </details>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/resilience-pathway"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white no-underline shadow-lg shadow-slate-900/10 transition hover:bg-sky-900"
          >
            Start
          </Link>
        </div>

        <details className="relative lg:hidden">
          <summary className="cursor-pointer rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
            Menu
          </summary>
          <div className="absolute right-0 top-12 max-h-[78vh] w-[min(88vw,24rem)] overflow-y-auto rounded-2xl border border-sky-100 bg-white p-4 text-left shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Navigate Aether</p>
            <div className="mt-3 grid gap-2">
              {[...primaryNavigation, ...secondaryNavigation].map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl border border-slate-100 p-3 no-underline">
                  <span className="block text-sm font-bold text-slate-900">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="border-t border-sky-50 bg-sky-50/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className="min-w-0 break-words font-semibold text-slate-700">{shareTagline}</p>
          <ul className="flex min-w-0 flex-wrap gap-2" aria-label="Aether trust signals">
            {trustSignals.map((signal) => (
              <li key={signal} className="rounded-full bg-white px-2.5 py-1 font-bold text-sky-900 shadow-sm">
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
