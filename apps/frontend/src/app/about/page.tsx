import React from 'react';
import { createPageMetadata, siteName, toAbsoluteUrl } from '../../lib/site';

export const metadata = createPageMetadata({
  title: `About ${siteName}`,
  description:
    'Learn what Aether is, how it combines AI and peer support, and why privacy-first student resilience is at the center of the product.',
  path: '/about',
  keywords: ['about aether', 'student resilience mission', 'peer support platform'],
});

export default function About() {
  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${siteName}`,
    url: toAbsoluteUrl('/about'),
    description:
      'Background and mission of Aether, a privacy-first student resilience platform combining guided pathways, AI support, and peer support.',
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">About Aether</h1>
        <p className="text-lg text-gray-700">Aether is a research-driven platform for student mental health resilience. It combines multi-modal AI, federated learning, and peer support to provide a secure, scalable, and human-centered intervention ecosystem.</p>
        <ul className="text-left text-gray-600 mt-6 space-y-2">
          <li><strong>Echo Chamber:</strong> Anonymized, voice-enabled outlet for catharsis.</li>
          <li><strong>AI-Triage:</strong> Real-time sentiment and biometric analysis for crisis detection.</li>
          <li><strong>Peer-Navigator:</strong> Peer matching for culturally responsive support.</li>
          <li><strong>Privacy & Ethics:</strong> Federated learning, zero-knowledge proofs, and SAFE-AI compliance.</li>
        </ul>
        <p className="text-xs text-gray-400 mt-4">See the README for research references and technical details.</p>
      </div>
    </section>
  );
}
