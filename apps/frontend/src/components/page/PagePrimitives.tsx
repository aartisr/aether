import Link from 'next/link';
import type { ReactNode } from 'react';

export function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export type JsonLdPayload = Record<string, unknown> | Array<Record<string, unknown>>;

export function JsonLd({ data, idPrefix = 'jsonld' }: { data?: JsonLdPayload; idPrefix?: string }) {
  const entries = data ? (Array.isArray(data) ? data : [data]) : [];

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={`${idPrefix}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}

export type ActionTarget = {
  href: string;
  label: string;
  external?: boolean;
};

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function ActionLink({
  href,
  label,
  className,
  external,
}: ActionTarget & {
  className?: string;
}) {
  const shouldUseAnchor = external || isExternalHref(href) || href.startsWith('mailto:');
  const linkClassName = cx(
    'inline-flex items-center text-sm font-semibold text-sky-700 no-underline hover:text-sky-900 hover:underline',
    className,
  );

  if (shouldUseAnchor) {
    const opensNewTab = external || isExternalHref(href);

    return (
      <a
        href={href}
        target={opensNewTab ? '_blank' : undefined}
        rel={opensNewTab ? 'noopener noreferrer' : undefined}
        className={linkClassName}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClassName}>
      {label}
    </Link>
  );
}

type PageBackdropProps = {
  children: ReactNode;
  className?: string;
};

export function PageBackdrop({ children, className }: PageBackdropProps) {
  return (
    <section
      className={cx(
        'min-h-screen bg-[radial-gradient(circle_at_top,_#f5fbff,_#ebf4ff_40%,_#e6f0fa_100%)] p-4 sm:p-6 md:p-8',
        className,
      )}
    >
      {children}
    </section>
  );
}

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cx('mx-auto w-full max-w-5xl space-y-6 md:space-y-8', className)}>{children}</div>;
}

type PageHeroProps = {
  title: string;
  description: string;
  kicker?: string;
};

export function PageHero({ title, description, kicker }: PageHeroProps) {
  return (
    <header className="rounded-3xl border border-sky-100 bg-white/85 p-6 text-center shadow-soft md:p-8">
      {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{kicker}</p> : null}
      <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-5xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-3xl text-base text-slate-700 md:text-lg">{description}</p>
    </header>
  );
}

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <article className={cx('rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-soft md:p-6', className)}>
      {children}
    </article>
  );
}

export type PageCardItem = {
  title: string;
  description: string;
  eyebrow?: string;
  href?: string;
  hrefLabel?: string;
};

type CardGridProps = {
  items: PageCardItem[];
  columns?: 'two' | 'three' | 'four';
  className?: string;
  itemClassName?: string;
  titleLevel?: 'h2' | 'h3';
};

const columnClassByCount = {
  two: 'md:grid-cols-2',
  three: 'md:grid-cols-2 lg:grid-cols-3',
  four: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function CardGrid({
  items,
  columns = 'two',
  className,
  itemClassName,
  titleLevel = 'h3',
}: CardGridProps) {
  const Title = titleLevel;

  return (
    <div className={cx('grid grid-cols-1 gap-4', columnClassByCount[columns], className)}>
      {items.map((item) => (
        <article key={item.title} className={cx('rounded-xl border border-slate-200 bg-white p-4', itemClassName)}>
          {item.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.eyebrow}</p>
          ) : null}
          <Title className="text-lg font-semibold text-slate-900">{item.title}</Title>
          <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
          {item.href && item.hrefLabel ? (
            <div className="mt-2">
              <ActionLink href={item.href} label={item.hrefLabel} />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

type LinkCardGridProps = {
  items: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  className?: string;
};

export function LinkCardGrid({ items, className }: LinkCardGridProps) {
  return (
    <div className={cx('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-2xl border border-slate-200 bg-white p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{item.description}</p>
        </Link>
      ))}
    </div>
  );
}
