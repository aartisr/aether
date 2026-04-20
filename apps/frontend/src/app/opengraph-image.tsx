import { ImageResponse } from 'next/og';
import { siteName, siteTitle } from '../lib/site';

export const runtime = 'edge';
export const alt = 'Aether student resilience platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #eaf2ff 0%, #d7e8ff 45%, #c7e2f7 100%)',
          color: '#102a43',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '64px',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '2px solid #b9d7f7',
            borderRadius: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            padding: '42px 48px',
            width: '100%',
          }}
        >
          <div style={{ color: '#1f4f82', fontSize: 36, fontWeight: 700 }}>{siteName}</div>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1 }}>{siteTitle}</div>
          <div style={{ color: '#2f5f8f', fontSize: 32, lineHeight: 1.35 }}>
            Privacy-first, research-driven wellbeing support for students.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
