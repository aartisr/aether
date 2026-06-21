import 'server-only';

import type { Data } from '@puckeditor/core';
import { aboutPageConfig, accessibilityPageConfig, privacyPageConfig } from '../info-pages';
import type { CmsPageDefinition } from './page-registry';
import { createDefaultCmsPageData, ensureContentIds } from './puck-config';

type LinkAction = { href: string; label: string };
type SectionColumns = 'two' | 'three' | 'four';
type MetricItem = { label: string; value: string; description: string };
type CardItem = { eyebrow?: string; title: string; description: string; href?: string; hrefLabel?: string };

type InfoLikeConfig = {
  kicker?: string;
  title: string;
  description: string;
  primaryAction?: LinkAction;
  secondaryAction?: LinkAction;
  metrics?: MetricItem[];
  itemSection?: { eyebrow?: string; title: string; description?: string; columns?: SectionColumns };
  items: CardItem[];
  sections?: Array<{ eyebrow?: string; title: string; description?: string; columns?: SectionColumns; items: CardItem[] }>;
  footerNote?: string;
  footerLink?: LinkAction;
};

function block(type: string, props: Record<string, unknown>) {
  return { type, props };
}

function fromInfoConfig(page: CmsPageDefinition, config: InfoLikeConfig): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      block('HeroBlock', { kicker: config.kicker, title: config.title, description: config.description }),
      block('ActionBlock', { primaryAction: config.primaryAction, secondaryAction: config.secondaryAction }),
      ...(config.metrics?.length ? [block('MetricsBlock', { title: 'Highlights', items: config.metrics })] : []),
      block('CardGridBlock', {
        eyebrow: config.itemSection?.eyebrow,
        title: config.itemSection?.title ?? 'Key areas',
        description: config.itemSection?.description,
        columns: config.itemSection?.columns ?? 'two',
        items: config.items,
      }),
      ...(config.sections ?? []).map((section) =>
        block('CardGridBlock', {
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
          columns: section.columns ?? 'two',
          items: section.items,
        }),
      ),
      ...(config.footerNote
        ? [
            block('NoticeBlock', {
              kicker: 'Continue with context',
              title: 'Next step',
              description: config.footerNote,
              link: config.footerLink,
            }),
          ]
        : []),
    ],
  });
}

export function createParityCmsPageData(page: CmsPageDefinition): Data | null {
  switch (page.id) {
    case 'about':
      return fromInfoConfig(page, aboutPageConfig);
    case 'accessibility':
      return fromInfoConfig(page, accessibilityPageConfig);
    case 'privacy':
      return fromInfoConfig(page, privacyPageConfig);
    default:
      return createDefaultCmsPageData(page);
  }
}
