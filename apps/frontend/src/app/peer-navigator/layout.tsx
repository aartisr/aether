import type { ReactNode } from 'react';
import { createPageMetadata } from '../../lib/site';
import { assertPageEnabledForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: 'Peer-Navigator',
  description:
    'Aether Peer-Navigator is a privacy-aware peer matching experience designed to reduce isolation and improve belonging for students.',
  path: '/peer-navigator',
  keywords: ['peer matching', 'student belonging', 'peer support network', 'privacy-aware matching'],
});

export default function PeerNavigatorLayout({ children }: { children: ReactNode }) {
  assertPageEnabledForRequest('peer-navigator');
  return children;
}
