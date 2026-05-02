import React from 'react';
import { ActionLink, CardGrid, JsonLd, PageBackdrop, PageContainer, PageHero, SurfaceCard } from './PagePrimitives';
import { isPathEnabledForRequest } from '../../lib/page-flags';

export type InfoPageItem = {
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
};

export type InfoPageConfig = {
  kicker?: string;
  title: string;
  description: string;
  items: InfoPageItem[];
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
  const shouldShowFooterLink = config.footerLink ? isPathEnabledForRequest(config.footerLink.href) : false;

  return (
    <PageBackdrop>
      <JsonLd data={config.jsonLd} idPrefix="generic-info-page-jsonld" />
      <PageContainer className="max-w-4xl">
        <PageHero title={config.title} description={config.description} kicker={config.kicker} />

        <SurfaceCard>
          <CardGrid items={visibleItems} columns="two" titleLevel="h2" className="text-left" />
        </SurfaceCard>

        {config.footerNote ? (
          <div className="text-center text-xs text-slate-500">
            <p>{config.footerNote}</p>
            {config.footerLink && shouldShowFooterLink ? (
              <div className="mt-1">
                <ActionLink
                  href={config.footerLink.href}
                  label={config.footerLink.label}
                  external={config.footerLink.external}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </PageContainer>
    </PageBackdrop>
  );
}
