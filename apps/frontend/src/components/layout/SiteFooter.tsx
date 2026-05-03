import Link from 'next/link';
import Image from 'next/image';
import SocialShareLinks from '../SocialShareLinks';
import { getFooterNavigationForRequest, trustSignals } from '../../lib/navigation';
import { authorName, authorUrl, shareTagline, siteName } from '../../lib/site';

const pcssIiUrl = 'https://saugus.pioneercss.org';

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  if (external || href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 no-underline hover:text-sky-900 hover:underline">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="text-sm text-slate-600 no-underline hover:text-sky-900 hover:underline">
      {label}
    </Link>
  );
}

export default function SiteFooter() {
  const footerNavigation = getFooterNavigationForRequest();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-sky-100 bg-white/90" role="contentinfo">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_2fr] md:px-6 lg:py-12">
        <section aria-label="Aether summary" className="space-y-5">
          <div>
            <p className="font-display text-3xl font-extrabold text-slate-950">{siteName}</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-650">{shareTagline}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-900">Safety Note</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Aether is a support and resilience experience, not emergency care. If there is imminent danger, contact local emergency services. In the United States, call or text 988.
            </p>
          </div>
          <SocialShareLinks path="/" title="Aether: Student Resiliency Ecosystem" compact />
        </section>

        <nav aria-label="Footer navigation" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {footerNavigation.map((group) => (
            <section key={group.title}>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}`}>
                    <FooterLink href={link.href} label={link.label} external={link.external} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>

      <div className="relative overflow-hidden border-t border-sky-100 bg-slate-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-1/2 h-28 w-80 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 text-xs md:grid-cols-[minmax(0,1.4fr)_auto] md:items-center md:px-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href={pcssIiUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit PCSS II Saugus"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white p-1.5 shadow-[0_18px_45px_rgba(14,165,233,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(14,165,233,0.26)]"
            >
              <Image
                src="/pcss-ii-logo.jpg"
                alt="PCSS II"
                width={220}
                height={229}
                className="h-full w-full rounded-xl object-contain"
                priority={false}
              />
            </a>
            <div className="min-w-0">
              <p className="font-semibold text-white">&copy; {currentYear} {siteName}. Research-driven. Privacy-first.</p>
              <p className="mt-1 max-w-2xl leading-5 text-slate-300">
                Aether logo artwork (c) {currentYear} {authorName}.{' '}
                <a
                  href={pcssIiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-100 underline decoration-sky-300/50 underline-offset-4 transition hover:text-white hover:decoration-white"
                >
                  Dedicated to PCSS II Students and Staff.
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-2 md:justify-end">
              {trustSignals.map((signal) => (
                <span key={`footer-${signal}`} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-bold text-sky-100">
                  {signal}
                </span>
              ))}
            </div>
            <a href={authorUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-100 no-underline hover:underline">
              {authorName}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
