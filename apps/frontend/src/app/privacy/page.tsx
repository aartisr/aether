import React from 'react';
import { createPageMetadata } from '../../lib/site';
import GenericInfoPage from '../../components/page/GenericInfoPage';
import { privacyPageConfig } from '../../lib/info-pages';
import { assertPageEnabledForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: 'Privacy & Data Ethics',
  description:
    'Understand how Aether approaches privacy, federated learning, minimized data exposure, identity protection, and ethical AI.',
  path: '/privacy',
  keywords: ['privacy-first ai', 'federated learning', 'student data ethics'],
});

export default function PrivacyEthics() {
  assertPageEnabledForRequest('privacy');
  return <GenericInfoPage config={privacyPageConfig} />;
}
