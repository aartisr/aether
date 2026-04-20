import type { ReactNode } from 'react';
import { createPageMetadata } from '../../lib/site';

export const metadata = createPageMetadata({
  title: 'Peer-Navigator',
  description:
    'Aether Peer-Navigator is a privacy-aware peer matching experience designed to reduce isolation and improve belonging for students.',
  path: '/peer-navigator',
  keywords: ['peer matching', 'student belonging', 'peer support network', 'privacy-aware matching'],
});

export default function PeerNavigatorLayout({ children }: { children: ReactNode }) {
  return children;
}
