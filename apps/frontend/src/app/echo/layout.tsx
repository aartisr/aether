import type { ReactNode } from 'react';
import { createPageMetadata } from '../../lib/site';
import { assertPageEnabledForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: 'Echo Chamber',
  description:
    'Use Aether Echo Chamber for private voice reflection, on-device transcription, and local sentiment and safety signal mapping.',
  path: '/echo',
  keywords: ['private voice journaling', 'on-device transcription', 'student reflection tool'],
});

export default function EchoLayout({ children }: { children: ReactNode }) {
  assertPageEnabledForRequest('echo');
  return children;
}
