"use client";
import React, { useState } from 'react';

const backgrounds = [
  'First-generation College Student',
  'LGBTQ+',
  'International Student',
  'Student of Color',
  'Neurodivergent',
  'Disability Community',
  'Veteran',
  'Other',
];

const peers = [
  { name: 'Alex', background: 'LGBTQ+', pronouns: 'they/them' },
  { name: 'Priya', background: 'International Student', pronouns: 'she/her' },
  { name: 'Jordan', background: 'First-generation College Student', pronouns: 'he/him' },
  { name: 'Samira', background: 'Student of Color', pronouns: 'she/her' },
  { name: 'Taylor', background: 'Neurodivergent', pronouns: 'they/them' },
  { name: 'Chris', background: 'Veteran', pronouns: 'he/him' },
];

export default function PeerNavigator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [match, setMatch] = useState<typeof peers[0] | null>(null);

  const handleMatch = () => {
    if (!selected) return;
    // Simulate matching logic
    const found = peers.find((p) => p.background === selected) || peers[Math.floor(Math.random() * peers.length)];
    setMatch(found);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Peer-Navigator Network</h1>
        <p className="text-lg text-gray-700">Connect with a peer who shares your background or experience. Reduce stigma and find support in a safe, private space.</p>
        <form className="mt-6 flex flex-col gap-4 items-center" onSubmit={(e) => { e.preventDefault(); handleMatch(); }}>
          <label htmlFor="background" className="block text-left w-full font-medium text-indigo-700">Select your background or identity:</label>
          <select
            id="background"
            className="w-full max-w-xs px-4 py-2 rounded border border-indigo-300 focus:ring-2 focus:ring-indigo-400"
            value={selected || ''}
            onChange={(e) => setSelected(e.target.value)}
            required
            aria-label="Select your background or identity"
          >
            <option value="" disabled>Select one...</option>
            {backgrounds.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition mt-2"
            disabled={!selected}
          >
            Find a Peer
          </button>
        </form>
        {match && (
          <div className="mt-8 p-4 rounded-lg bg-white shadow text-left max-w-md mx-auto">
            <h3 className="text-xl font-bold text-indigo-700 mb-2">Matched Peer</h3>
            <p className="text-lg font-medium">{match.name} <span className="text-sm text-gray-500">({match.pronouns})</span></p>
            <p className="text-gray-600">Background: {match.background}</p>
            <p className="text-xs text-gray-400 mt-2">All matches are anonymized. No personal data is stored or shared.</p>
          </div>
        )}
        <div className="text-xs text-gray-400 mt-4">This is a demo. In production, matching is privacy-preserving and peer-verified.</div>
      </div>
    </section>
  );
}
