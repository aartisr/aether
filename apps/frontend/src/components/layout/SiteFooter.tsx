import Link from 'next/link';
import SocialShareLinks from '../SocialShareLinks';
import { footerNavigation, trustSignals } from '../../lib/navigation';
import { authorName, authorUrl, shareTagline, siteName } from '../../lib/site';

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
  return (
    <footer className="mt-14 border-t border-sky-100 bg-white/88" role="contentinfo">
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

      <div className="border-t border-sky-100 bg-slate-950 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 text-xs md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p>&copy; {new Date().getFullYear()} {siteName}. Research-driven. Privacy-first.</p>
            <p className="mt-1 text-slate-300">
              Logo artwork (c) {new Date().getFullYear()} {authorName}. Dedicated to PCSS II Students.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {trustSignals.map((signal) => (
              <span key={`footer-${signal}`} className="rounded-full border border-white/15 px-2.5 py-1 font-bold text-sky-100">
                {signal}
              </span>
            ))}
          </div>
          <a href={authorUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-100 no-underline hover:underline">
            {authorName}
          </a>
        </div>
      </div>
    </footer>
  );
}
