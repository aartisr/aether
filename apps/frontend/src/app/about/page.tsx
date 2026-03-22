import React from 'react';

export default function About() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
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
