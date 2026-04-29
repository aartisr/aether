import React from 'react';
import { createPageMetadata } from '../../lib/site';
import GenericInfoPage from '../../components/page/GenericInfoPage';
import { accessibilityPageConfig } from '../../lib/info-pages';

export const metadata = createPageMetadata({
  title: 'Accessibility',
  description:
    'Read about Aether accessibility commitments, keyboard support, inclusive design choices, and SAFE-AI compliance.',
  path: '/accessibility',
  keywords: ['wcag 2.1 aa', 'accessible student support', 'inclusive ai design'],
});

export default function AccessibilityCompliance() {
  return <GenericInfoPage config={accessibilityPageConfig} />;
}
