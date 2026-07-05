import React from 'react';
import { ActionLink, CardGrid, JsonLd, PageBackdrop, PageContainer, PageHero, SurfaceCard } from './PagePrimitives';
import { isPathEnabledForRequest } from '../../lib/page-flags';

export type InfoPageItem = {
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  eyebrow?: string;
};

export type InfoPageMetric = {
  value: string;
  label: string;
  description: string;
};

export type InfoPageSection = {
  eyebrow?: string;
  title: string;
  description?: string;
  items: InfoPageItem[];
  columns?: 'two' | 'three' | 'four';
};

export type InfoPageConfig = {
  kicker?: string;
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
    external?: boolean;
  };
  secondaryAction?: {
    href: string;
    label: string;
    external?: boolean;
  };
  metrics?: InfoPageMetric[];
  itemSection?: {
    eyebrow?: string;
    title: string;
    description?: string;
    columns?: 'two' | 'three' | 'four';
  };
  items: InfoPageItem[];
  sections?: InfoPageSection[];
  footerNote?: string;
  footerLink?: {
    href: string;
    label: string;
    external?: boolean;
  };
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export default function GenericInfoPage({ config }: { config: InfoPageConfig }) {
  const visibleItems = config.items.filter((item) => (item.href ? isPathEnabledForRequest(item.href) : true));
  const visibleSections =
    config.sections
      ?.map((section) => ({
        ...section,
        items: section.items.filter((item) => (item.href ? isPathEnabledForRequest(item.href) : true)),
      }))
      .filter((section) => section.items.length > 0) ?? [];
  const shouldShowFooterLink = config.footerLink ? isPathEnabledForRequest(config.footerLink.href) : false;
  const shouldShowPrimaryAction = config.primaryAction ? isPathEnabledForRequest(config.primaryAction.href) : false;
  const shouldShowSecondaryAction = config.secondaryAction ? isPathEnabledForRequest(config.secondaryAction.href) : false;

  return (
    <PageBackdrop>
      <JsonLd data={config.jsonLd} idPrefix="generic-info-page-jsonld" />
      <PageContainer className="max-w-6xl">
        <PageHero title={config.title} description={config.description} kicker={config.kicker} />

        {(config.primaryAction && shouldShowPrimaryAction) || (config.secondaryAction && shouldShowSecondaryAction) ? (
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            {config.primaryAction && shouldShowPrimaryAction ? (
              <ActionLink
                href={config.primaryAction.href}
                label={config.primaryAction.label}
                external={config.primaryAction.external}
                className="justify-center rounded-lg bg-emerald-800 px-5 py-3 text-white hover:bg-emerald-900 hover:no-underline"
              />
            ) : null}
            {config.secondaryAction && shouldShowSecondaryAction ? (
              <ActionLink
                href={config.secondaryAction.href}
                label={config.secondaryAction.label}
                external={config.secondaryAction.external}
                className="justify-center rounded-lg border border-emerald-200 bg-white px-5 py-3 text-emerald-900 hover:bg-emerald-50 hover:no-underline"
              />
            ) : null}
          </div>
        ) : null}

        {visibleSections.length > 0 ? (
          <SurfaceCard className="border-emerald-100 bg-emerald-50/45">
            <p className="theme-kicker">On this page</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Start with one section. Each area is intentionally scoped so you can scan quickly and only expand what you need.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleSections.map((section) => (
                <a
                  key={section.title}
                  href={`#${slugify(section.title)}`}
                  className="theme-pill no-underline hover:no-underline"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </SurfaceCard>
        ) : null}

        {config.metrics?.length ? (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Page highlights">
            {config.metrics.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-black text-emerald-900">{metric.value}</p>
                <h2 className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-slate-900">{metric.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{metric.description}</p>
              </article>
            ))}
          </section>
        ) : null}

        <SurfaceCard className="border-emerald-100 bg-white">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
              {config.itemSection?.eyebrow ?? 'Page guide'}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{config.itemSection?.title ?? 'Key areas'}</h2>
            {config.itemSection?.description ? (
              <p className="mt-2 text-sm leading-7 text-slate-700">{config.itemSection.description}</p>
            ) : null}
          </div>
          <CardGrid
            items={visibleItems}
            columns={config.itemSection?.columns ?? 'two'}
            titleLevel="h3"
            className="mt-5 text-left"
          />
        </SurfaceCard>

        {visibleSections.map((section, sectionIndex) => {
          return (
            <section key={section.title} id={slugify(section.title)} className="scroll-mt-24">
              <details open={sectionIndex === 0} className="group">
                <summary className="list-none">
                  <SurfaceCard className="cursor-pointer border-slate-200 bg-white transition group-open:border-emerald-200">
                    {section.eyebrow ? (
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-800">{section.eyebrow}</p>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
                      <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-slate-700">
                        Expand
                      </span>
                    </div>
                    {section.description ? (
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700">{section.description}</p>
                    ) : null}
                  </SurfaceCard>
                </summary>

                <div
                  className={`mt-4 grid grid-cols-1 gap-4 ${
                    section.columns === 'four'
                      ? 'sm:grid-cols-2 lg:grid-cols-4'
                      : section.columns === 'three'
                        ? 'md:grid-cols-2 lg:grid-cols-3'
                        : 'md:grid-cols-2'
                  }`}
                >
                  {section.items.map((item) => (
                    <article key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      {item.eyebrow ? (
                        <p className="text-xs font-black uppercase tracking-[0.1em] text-emerald-800">{item.eyebrow}</p>
                      ) : null}
                      <h3 className="mt-1 text-base font-black text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
                      {item.href && item.hrefLabel ? (
                        <div className="mt-3">
                          <ActionLink href={item.href} label={item.hrefLabel} className="text-emerald-800" />
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </details>
            </section>
          );
        })}

        {config.footerNote ? (
          <div className="theme-card mx-auto max-w-3xl p-5 text-center">
            <p className="theme-kicker">Continue with context</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--theme-text-muted)]">{config.footerNote}</p>
            {config.footerLink && shouldShowFooterLink ? (
              <div className="mt-1">
                <ActionLink
                  href={config.footerLink.href}
                  label={config.footerLink.label}
                  external={config.footerLink.external}
                  className="mt-3 justify-center rounded-[var(--theme-radius-md)] border border-[color:var(--theme-border)] bg-white px-4 py-2 text-[color:var(--theme-primary-strong)] hover:bg-[color:var(--theme-bg-soft)] hover:no-underline"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </PageContainer>
    </PageBackdrop>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
