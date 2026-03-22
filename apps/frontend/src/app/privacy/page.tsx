import React from 'react';
import Link from 'next/link';

export default function PrivacyEthics() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Privacy & Data Ethics</h1>
        <p className="text-lg text-gray-700">Aether is built on a privacy-first, research-driven foundation. Your data and well-being are protected by design.</p>
        <div className="bg-white rounded-lg shadow p-6 text-left space-y-4">
          <div>
            <h3 className="font-semibold text-indigo-700">Federated Learning</h3>
            <p className="text-gray-600 text-sm">All AI models are trained locally on your device. No raw mental health data ever leaves your handset. <span className="font-medium">Your privacy is never compromised.</span></p>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-700">Zero-Knowledge Proofs</h3>
            <p className="text-gray-600 text-sm">Aether verifies your identity and university affiliation without exposing personal identifiers to any central database. <span className="font-medium">You remain anonymous and secure.</span></p>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-700">SAFE-AI Compliance</h3>
            <p className="text-gray-600 text-sm">Aether implements the 2026 Huntsman Mental Health Institute checkpoints to mitigate bias drift and ensure equitable care for all linguistic and cultural backgrounds.</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-4">For more details, see the <Link href="/about" className="underline text-indigo-600">About</Link> page and the project README.</div>
      </div>
    </section>
  );
}
