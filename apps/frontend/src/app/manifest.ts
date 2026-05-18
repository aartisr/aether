import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aether: Student Resiliency Ecosystem',
    short_name: 'Aether',
    description: 'Privacy-first, research-driven resilience support for students.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F0F4FF',
    theme_color: '#2B5D8C',
    lang: 'en',
    categories: ['education', 'health', 'productivity'],
    shortcuts: [
      {
        name: 'About Aether',
        short_name: 'About',
        description: 'Review the mission, boundaries, and product context for Aether.',
        url: '/about',
      },
      {
        name: 'Privacy and Data Ethics',
        short_name: 'Privacy',
        description: 'Review Aether privacy commitments and data ethics posture.',
        url: '/privacy',
      },
      {
        name: 'Aether Journal',
        short_name: 'Journal',
        description: 'Read practical student resilience guides.',
        url: '/blog',
      },
      {
        name: 'Ask Aether',
        short_name: 'Ask',
        description: 'Ask source-grounded questions across Aether content.',
        url: '/ask',
      },
      {
        name: 'Feedback',
        short_name: 'Feedback',
        description: 'Report an issue or suggest a useful improvement.',
        url: '/feedback',
      },
    ],
    icons: [
      {
        src: '/aether-logo-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
