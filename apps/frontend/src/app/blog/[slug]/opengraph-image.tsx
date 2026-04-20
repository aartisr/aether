import { ImageResponse } from 'next/og';
import { siteName } from '../../../lib/site';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

type BlogPostImageProps = {
  params: {
    slug: string;
  };
};

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function generateImageMetadata({ params }: BlogPostImageProps) {
  const title = titleFromSlug(params.slug);

  return [
    {
      id: params.slug,
      alt: title ? `${title} | ${siteName}` : `${siteName} blog article`,
      size,
      contentType,
    },
  ];
}

export default function BlogPostOpenGraphImage({ params }: BlogPostImageProps) {
  const title = titleFromSlug(params.slug) || `${siteName} Blog`;
  const excerpt = 'Practical, evidence-informed writing for student resilience.';

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,0.95), rgba(221,236,255,0.85) 42%, rgba(181,215,255,0.92) 100%)',
          color: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: '56px',
          width: '100%',
        }}
      >
        <div
          style={{
            color: '#1d4ed8',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {siteName} Journal
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.84)',
            border: '2px solid rgba(147,197,253,0.9)',
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            padding: '40px 44px',
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
          <div style={{ color: '#334155', fontSize: 28, lineHeight: 1.35 }}>{excerpt}</div>
        </div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            fontSize: 24,
            fontWeight: 600,
            justifyContent: 'space-between',
          }}
        >
          <div>Privacy-first student resilience</div>
          <div>aether</div>
        </div>
      </div>
    ),
    size,
  );
}
