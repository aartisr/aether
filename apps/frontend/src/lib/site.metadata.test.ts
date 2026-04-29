import {
  createArticleMetadata,
  createCollectionPageJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  toAbsoluteUrl,
} from './site';

function normalizeForSnapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('site metadata snapshots', () => {
  it('matches page metadata snapshot', () => {
    const metadata = createPageMetadata({
      title: 'Accessibility',
      description: 'Accessibility commitments and support resources.',
      path: '/accessibility',
      keywords: ['accessibility', 'student wellbeing'],
    });

    expect(normalizeForSnapshot(metadata)).toMatchSnapshot();
  });

  it('matches article metadata snapshot', () => {
    const metadata = createArticleMetadata({
      title: 'How to Stabilize Your Baseline',
      description: 'Practical checklist for stabilizing during stress spikes.',
      path: '/blog/practical-path-01-stabilize-your-baseline',
      imagePath: '/blog/practical-path-01-stabilize-your-baseline/opengraph-image',
      keywords: ['resilience', 'stability'],
      tags: ['resilience', 'checklist'],
      publishedTime: '2026-04-01T00:00:00.000Z',
      modifiedTime: '2026-04-02T00:00:00.000Z',
    });

    expect(normalizeForSnapshot(metadata)).toMatchSnapshot();
  });

  it('matches JSON-LD helper snapshots', () => {
    const webPage = createWebPageJsonLd({
      name: 'Privacy and Data Ethics',
      path: '/privacy',
      description: 'Privacy-by-design approach and ethical AI controls.',
      about: ['privacy', 'ethics'],
    });

    const collectionPage = createCollectionPageJsonLd({
      name: 'Aether Blog',
      path: '/blog',
      description: 'Evidence-informed resilience writing.',
      items: [
        {
          name: 'Stabilize Your Baseline',
          url: toAbsoluteUrl('/blog/practical-path-01-stabilize-your-baseline'),
          description: 'Foundational recovery guide.',
        },
        {
          name: 'Build Your Support Map',
          url: toAbsoluteUrl('/blog/practical-path-02-build-your-support-map'),
          description: 'Mapping people and channels for support.',
        },
      ],
    });

    expect(normalizeForSnapshot({ webPage, collectionPage })).toMatchSnapshot();
  });
});
