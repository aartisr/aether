import type { ReactNode } from 'react';
import { createPageMetadata } from '../../lib/site';

export const metadata = createPageMetadata({
  title: 'Fairness & Governance',
  description:
    'Review Aether fairness metrics, policy guidance, and audit transparency for the peer matching system.',
  path: '/fairness-governance',
  keywords: ['algorithmic fairness', 'ai governance', 'audit dashboard', 'transparent matching'],
});

export default function FairnessGovernanceLayout({ children }: { children: ReactNode }) {
  return children;
}
