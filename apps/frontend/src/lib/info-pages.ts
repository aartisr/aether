import type { InfoPageConfig } from '../components/page/GenericInfoPage';
import { createItemListJsonLd, createWebPageJsonLd, toAbsoluteUrl } from './site';

export const aboutPageConfig: InfoPageConfig = {
  kicker: 'Aether Platform',
  title: 'About Aether',
  description:
    'A research-driven student resilience platform that blends private reflection, practical intervention workflows, and peer support.',
  items: [
    {
      title: 'Echo Chamber',
      description:
        'A private voice reflection space where students can process stress and receive on-device sentiment and safety cues.',
      href: '/echo',
      hrefLabel: 'Explore Echo Chamber',
    },
    {
      title: 'Peer-Navigator',
      description:
        'A privacy-aware matching experience designed to improve belonging while preserving identity safety.',
      href: '/peer-navigator',
      hrefLabel: 'Open Peer-Navigator',
    },
    {
      title: 'Resilience Pathway',
      description:
        'A modular intervention flow covering check-ins, safety planning, resource routing, peer circles, and sustainable habits.',
      href: '/resilience-pathway',
      hrefLabel: 'View Resilience Pathway',
    },
    {
      title: 'Privacy and Governance',
      description:
        'Designed with local-first processing, transparent policy boundaries, and fairness-focused auditability.',
      href: '/privacy',
      hrefLabel: 'Read Privacy Commitments',
    },
  ],
  footerNote: 'See documentation for technical details and implementation notes.',
  jsonLd: [
    createWebPageJsonLd({
      name: 'About Aether',
      path: '/about',
      description:
        'Background and mission of Aether, a privacy-first student resilience platform combining guided pathways, AI support, and peer support.',
      about: ['student resilience', 'privacy-first AI', 'peer support'],
    }),
    createItemListJsonLd([
      { name: 'Echo Chamber', url: toAbsoluteUrl('/echo') },
      { name: 'Peer-Navigator', url: toAbsoluteUrl('/peer-navigator') },
      { name: 'Resilience Pathway', url: toAbsoluteUrl('/resilience-pathway') },
      { name: 'Privacy and Governance', url: toAbsoluteUrl('/privacy') },
    ]),
  ],
};

export const accessibilityPageConfig: InfoPageConfig = {
  kicker: 'Inclusive Design',
  title: 'Accessibility and SAFE-AI Compliance',
  description:
    'Aether is built for readability, keyboard access, and fairness-aware AI behavior across different user contexts.',
  items: [
    {
      title: 'Accessibility Baseline',
      description:
        'Interfaces target WCAG 2.1 AA with keyboard navigation, clear focus states, and robust semantic markup.',
      href: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
      hrefLabel: 'Review WCAG Guidelines',
    },
    {
      title: 'Safe Interaction Patterns',
      description:
        'Visual hierarchy, language clarity, and low-cognitive-load flows are prioritized for student wellbeing scenarios.',
    },
    {
      title: 'SAFE-AI Governance',
      description:
        'Model behavior, triage messaging, and fairness checks are reviewed under documented governance controls.',
      href: '/fairness-governance',
      hrefLabel: 'View Fairness Dashboard',
    },
  ],
  footerNote: 'Need assistance or want to report an issue?',
  footerLink: {
    href: 'mailto:accessibility@aether.org',
    label: 'Contact accessibility support',
  },
  jsonLd: createWebPageJsonLd({
    name: 'Accessibility and SAFE-AI Compliance',
    path: '/accessibility',
    description:
      'Accessibility commitments, keyboard support patterns, and SAFE-AI alignment for student-facing experiences.',
    about: ['wcag', 'safe-ai compliance', 'inclusive design'],
  }),
};

export const privacyPageConfig: InfoPageConfig = {
  kicker: 'Privacy by Design',
  title: 'Privacy and Data Ethics',
  description:
    'Student wellbeing workflows are built to minimize data exposure while preserving practical support outcomes.',
  items: [
    {
      title: 'Local-First Processing',
      description:
        'Sensitive voice and sentiment analysis stay on-device by default to reduce data transfer and central retention.',
    },
    {
      title: 'Identity Safety Patterns',
      description:
        'System interactions prioritize pseudonymity, constrained metadata, and explicit consent boundaries.',
    },
    {
      title: 'Ethical AI Controls',
      description:
        'Fairness checkpoints and escalation boundaries are reviewed to avoid overreach in high-sensitivity contexts.',
      href: '/fairness-governance',
      hrefLabel: 'Inspect Governance Controls',
    },
  ],
  footerNote: 'For mission context and architecture background, continue to the About page.',
  footerLink: {
    href: '/about',
    label: 'Go to About',
  },
  jsonLd: createWebPageJsonLd({
    name: 'Privacy and Data Ethics',
    path: '/privacy',
    description:
      'Privacy-by-design guidance for student wellbeing workflows, including local-first processing and ethical AI controls.',
    about: ['privacy by design', 'data minimization', 'ethical ai'],
  }),
};
