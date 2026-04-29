import React from 'react';
import { createPageMetadata, siteName } from '../../lib/site';
import GenericInfoPage from '../../components/page/GenericInfoPage';
import { aboutPageConfig } from '../../lib/info-pages';

export const metadata = createPageMetadata({
  title: `About ${siteName}`,
  description:
    'Learn what Aether is, how it combines AI and peer support, and why privacy-first student resilience is at the center of the product.',
  path: '/about',
  keywords: ['about aether', 'student resilience mission', 'peer support platform'],
});

export default function About() {
  return <GenericInfoPage config={aboutPageConfig} />;
}
