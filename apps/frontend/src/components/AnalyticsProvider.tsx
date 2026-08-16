'use client';

import { Analytics } from '@vercel/analytics/react';
import PostHogProvider from './PostHogProvider';

export default function AnalyticsProvider() {
  return (
    <>
      <Analytics />
      <PostHogProvider />
    </>
  );
}
