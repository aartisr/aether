import React from 'react';
import { createPageMetadata } from '../../lib/site';

export const metadata = createPageMetadata({
  title: 'Accessibility',
  description:
    'Read about Aether accessibility commitments, keyboard support, inclusive design choices, and SAFE-AI compliance.',
  path: '/accessibility',
  keywords: ['wcag 2.1 aa', 'accessible student support', 'inclusive ai design'],
});

export default function AccessibilityCompliance() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Accessibility & SAFE-AI Compliance</h1>
        <p className="text-lg text-gray-700">Aether is committed to accessibility and ethical AI for all users, regardless of ability or background.</p>
        <div className="bg-white rounded-lg shadow p-6 text-left space-y-4">
          <div>
            <h3 className="font-semibold text-indigo-700">Accessibility</h3>
            <p className="text-gray-600 text-sm">All interfaces are designed to meet <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">WCAG 2.1 AA</a> standards. Features include keyboard navigation, ARIA labels, high-contrast modes, and screen reader support.</p>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-700">SAFE-AI Compliance</h3>
            <p className="text-gray-600 text-sm">Aether follows the 2026 Huntsman Mental Health Institute SAFE-AI checkpoints, ensuring fairness, transparency, and bias mitigation in all AI-driven features.</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-4">For accessibility help or to report an issue, contact <a href="mailto:accessibility@aether.org" className="underline text-indigo-600">accessibility@aether.org</a>.</div>
      </div>
    </section>
  );
}
