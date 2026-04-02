import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aether: Student Resiliency Ecosystem',
    short_name: 'Aether',
    description: 'Privacy-first, research-driven resilience support for students.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F4FF',
    theme_color: '#2B5D8C',
    lang: 'en',
  };
}
