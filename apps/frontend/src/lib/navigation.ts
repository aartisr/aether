export type NavigationLink = {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
};

export type NavigationGroup = {
  title: string;
  links: NavigationLink[];
};

export const primaryNavigation: NavigationLink[] = [
  {
    href: '/resilience-pathway',
    label: 'Resilience Hub',
    description: 'Guided check-ins, safety planning, resource routing, peer circles, and habits.',
  },
  {
    href: '/echo',
    label: 'Echo',
    description: 'Private reflection with on-device transcript and sentiment mapping.',
  },
  {
    href: '/peer-navigator',
    label: 'Peer Navigator',
    description: 'Privacy-aware peer matching with explainable fairness controls.',
  },
  {
    href: '/blog',
    label: 'Journal',
    description: 'Practical, evidence-informed student resilience guides.',
  },
];

export const secondaryNavigation: NavigationLink[] = [
  {
    href: '/fairness-governance',
    label: 'Governance',
    description: 'Fairness metrics, policy posture, and auditability.',
  },
  {
    href: '/privacy',
    label: 'Privacy',
    description: 'Local-first design, minimized data exposure, and identity safety.',
  },
  {
    href: '/accessibility',
    label: 'Accessibility',
    description: 'Inclusive design commitments and SAFE-AI guidance.',
  },
  {
    href: '/about',
    label: 'About',
    description: 'Mission, architecture, and product context.',
  },
  {
    href: '/mentors',
    label: 'Mentors',
    description: 'Public gratitude for the guidance behind Aether.',
  },
];

export const trustSignals = [
  'Privacy-first',
  'Peer support',
  'Safety-aware',
  'AI-readable',
] as const;

export const footerNavigation: NavigationGroup[] = [
  {
    title: 'Product',
    links: [
      { href: '/resilience-pathway', label: 'Resilience Hub' },
      { href: '/echo', label: 'Echo Chamber' },
      { href: '/peer-navigator', label: 'Peer Navigator' },
      { href: '/blog', label: 'Aether Journal' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/accessibility', label: 'Accessibility' },
      { href: '/fairness-governance', label: 'Fairness Governance' },
      { href: 'https://988lifeline.org/', label: '988 Lifeline', external: true },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About Aether' },
      { href: '/mentors', label: 'Mentors' },
      { href: '/feed.xml', label: 'RSS Feed' },
      { href: '/llms.txt', label: 'AI Guide' },
    ],
  },
  {
    title: 'Machine-Readable',
    links: [
      { href: '/sitemap.xml', label: 'Sitemap' },
      { href: '/image-sitemap.xml', label: 'Image Sitemap' },
      { href: '/robots.txt', label: 'Robots' },
      { href: '/manifest.webmanifest', label: 'Web Manifest' },
    ],
  },
];
