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
        name: 'Resilience Pathway',
        short_name: 'Pathway',
        description: 'Open the guided resilience support hub.',
        url: '/resilience-pathway',
      },
      {
        name: 'Echo Chamber',
        short_name: 'Echo',
        description: 'Open private reflection and sentiment mapping.',
        url: '/echo',
      },
      {
        name: 'Aether Journal',
        short_name: 'Journal',
        description: 'Read practical student resilience guides.',
        url: '/blog',
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
