import type { InfoPageConfig } from '../components/page/GenericInfoPage';
import { createItemListJsonLd, createWebPageJsonLd, toAbsoluteUrl } from './site';

export const aboutPageConfig: InfoPageConfig = {
  kicker: 'Aether Platform',
  title: 'About Aether',
  description:
    'Aether is a privacy-first student resilience ecosystem that helps students reflect, understand what kind of support fits the moment, and move toward safer next steps without pretending to be therapy or emergency care.',
  primaryAction: {
    href: '/resilience-pathway',
    label: 'Open Resilience Hub',
  },
  secondaryAction: {
    href: '/privacy',
    label: 'Review Privacy Model',
  },
  metrics: [
    {
      value: '5',
      label: 'support modules',
      description: 'Reflection, check-ins, safety planning, resource routing, and peer connection.',
    },
    {
      value: '0',
      label: 'diagnostic claims',
      description: 'Aether supports awareness and navigation; it does not diagnose, treat, or replace care.',
    },
    {
      value: 'Local',
      label: 'privacy posture',
      description: 'Sensitive reflection experiences are designed around data minimization and local-first patterns.',
    },
    {
      value: 'Modular',
      label: 'deployment model',
      description: 'Campuses and teams can enable, disable, or swap pathways without rebuilding the product.',
    },
  ],
  itemSection: {
    eyebrow: 'Platform map',
    title: 'How Aether fits together',
    description:
      'Each capability can stand alone, but the complete system gives students a coherent path from reflection to support.',
  },
  items: [
    {
      title: 'Echo Chamber',
      description:
        'A private voice reflection space where students can process stress and receive local sentiment and safety cues without turning reflection into a public record.',
      href: '/echo',
      hrefLabel: 'Explore Echo Chamber',
      eyebrow: 'Reflect',
    },
    {
      title: 'Peer-Navigator',
      description:
        'A privacy-aware matching experience designed to improve belonging while preserving identity safety and fairness review.',
      href: '/peer-navigator',
      hrefLabel: 'Open Peer-Navigator',
      eyebrow: 'Connect',
    },
    {
      title: 'Resilience Pathway',
      description:
        'A modular intervention flow covering check-ins, safety planning, resource routing, peer circles, and sustainable habits.',
      href: '/resilience-pathway',
      hrefLabel: 'View Resilience Pathway',
      eyebrow: 'Navigate',
    },
    {
      title: 'Privacy and Governance',
      description:
        'Designed with local-first processing, transparent policy boundaries, and fairness-focused auditability.',
      href: '/privacy',
      hrefLabel: 'Read Privacy Commitments',
      eyebrow: 'Trust',
    },
  ],
  sections: [
    {
      eyebrow: 'Mission',
      title: 'Why Aether exists',
      description:
        'Students often need help before a crisis, but traditional support pathways can feel hard to find, stigmatizing, or too heavy for early stress. Aether fills the space between doing nothing and formal care by making small, responsible next steps easier to reach.',
      columns: 'three',
      items: [
        {
          title: 'Lower the first step',
          description:
            'The product starts with low-pressure reflection and simple routing so students can name what is happening before they need a formal appointment.',
        },
        {
          title: 'Protect dignity',
          description:
            'Aether avoids shame-heavy language, diagnostic labels, and hidden surveillance patterns. The student remains a person, not a risk score.',
        },
        {
          title: 'Support real handoffs',
          description:
            'The experience points toward peer support, campus services, trusted people, and crisis resources when the situation calls for more than self-guided tools.',
        },
      ],
    },
    {
      eyebrow: 'Operating principles',
      title: 'What makes the system safe to reuse',
      description:
        'The About page should make the product boundaries obvious. These principles keep Aether generic enough for many institutions while preserving a serious safety posture.',
      columns: 'four',
      items: [
        {
          title: 'Non-clinical by default',
          description:
            'Aether provides education, reflection, and navigation support. It is not a medical device, therapist, counselor, emergency responder, or diagnostic tool.',
        },
        {
          title: 'Privacy before personalization',
          description:
            'Personalization should come from explicit context and local interactions where possible, not broad collection of sensitive student data.',
        },
        {
          title: 'Human pathways stay visible',
          description:
            'Crisis support, trusted contacts, campus resources, and peer pathways remain visible instead of being buried behind AI chat or long intake flows.',
        },
        {
          title: 'Config over rewrites',
          description:
            'Content, resources, page availability, and support pathways are modeled as swappable configuration wherever possible.',
        },
      ],
    },
    {
      eyebrow: 'Boundaries',
      title: 'What Aether is and is not',
      description:
        'A clear About page should build trust by saying where the product helps and where it must step aside.',
      columns: 'two',
      items: [
        {
          title: 'Aether is a resilience layer',
          description:
            'It helps students reflect, practice coping habits, organize support plans, and find the next appropriate resource.',
        },
        {
          title: 'Aether is not emergency care',
          description:
            'If someone may be in immediate danger, the right path is local emergency services or a crisis line such as 988 in the United States.',
          href: 'https://988lifeline.org/',
          hrefLabel: 'Visit 988 Lifeline',
        },
      ],
    },
  ],
  footerNote: 'Aether is designed as a humane support layer: practical, privacy-aware, and careful about its limits.',
  jsonLd: [
    createWebPageJsonLd({
      name: 'About Aether',
      path: '/about',
      description:
        'Background, mission, operating principles, and product boundaries for Aether, a privacy-first student resilience ecosystem.',
      about: ['student resilience', 'privacy-first AI', 'peer support', 'student wellbeing navigation'],
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
