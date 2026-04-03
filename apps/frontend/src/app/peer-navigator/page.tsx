"use client";
import React, { useState } from 'react';

import { createPeerMatchingEngine, type MatchProfile } from '../../lib/peer-matching';

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

type PeerAttributes = {
  name: string;
  background: string;
  pronouns: string;
  role: 'self' | 'peer';
};

const matcher = createPeerMatchingEngine<MatchProfile<PeerAttributes>>({
  phase1: {
    maxCandidatesPerProfile: 25,
    hardFilter: (source, target) => source.id !== target.id && target.attributes.role === 'peer',
    directedScore: (source, target) => {
      const sameBackground = source.attributes.background === target.attributes.background;
      return sameBackground ? 0.95 : 0.45;
    },
    minReciprocalScore: 0.3, // NEW: Quality floor filtering
  },
  phase2: {
    enableStabilityRefinement: true,
    fairness: {
      groupKey: (profile) => profile.attributes.background,
      maxShareDelta: 0.35,
      underExposureBoost: 0.5, // NEW: Fairness parameters
      overExposurePenalty: 0.6,
    },
  },
  phase3: {
    qualityFloor: 0.35,
    explorationWeight: 0.2,
    uncertaintyWeight: 0.1, // NEW: Separate uncertainty weight
    randomJitter: 0.02,
    rngSeed: 42, // NEW: Deterministic seed for reproducible matching
  },
});

type MatchResult = {
  name: string;
  background: string;
  pronouns: string;
  phase1Score?: number;
  phase2Score?: number;
  phase3Score?: number;
  fairnessAdjusted?: boolean;
  fairnessAdjustmentMagnitude?: number;
};

export default function PeerNavigator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [metrics, setMetrics] = useState<{ totalProfiles: number; totalCandidates: number; totalFinalAssignments: number; averageFinalScore: number } | null>(null);
  const [showMetricsDetail, setShowMetricsDetail] = useState(false);

  const handleMatch = () => {
    if (!selected) return;

    const profiles: MatchProfile<PeerAttributes>[] = [
      {
        id: 'self',
        attributes: {
          name: 'You',
          background: selected,
          pronouns: 'prefer not to say',
          role: 'self',
        },
        capacity: 1, // NEW: Support for multi-match scenarios
      },
      ...peers.map((peer, index) => ({
        id: `peer-${index}`,
        attributes: {
          name: peer.name,
          background: peer.background,
          pronouns: peer.pronouns,
          role: 'peer' as const,
        },
      })),
    ];

    const output = matcher.match(profiles, {
      phase: 'phase3',
      maxAssignments: 3,
    });

    // NEW: Extract and display cycle metrics
    if (output.metrics) {
      setMetrics(output.metrics);
    }

    const rankedForSelf = output.candidates
      .filter((candidate) => candidate.aId === 'self' || candidate.bId === 'self')
      .sort((left, right) => right.phase3Score - left.phase3Score);

    const findPeerFromCandidate = (candidate: (typeof rankedForSelf)[number]): MatchResult | null => {
      const peerId = candidate.aId === 'self' ? candidate.bId : candidate.aId;
      const profile = profiles.find((entry) => entry.id === peerId);
      if (!profile || profile.attributes.role !== 'peer') return null;
      
      // Extract phase scores for audit trail
      const fairnessAdjustmentMagnitude = (candidate.phase2Score ?? 0) - (candidate.phase1Score ?? 0);
      
      return {
        name: profile.attributes.name,
        background: profile.attributes.background,
        pronouns: profile.attributes.pronouns,
        phase1Score: candidate.phase1Score,
        phase2Score: candidate.phase2Score,
        phase3Score: candidate.phase3Score,
        fairnessAdjusted: fairnessAdjustmentMagnitude !== 0,
        fairnessAdjustmentMagnitude: fairnessAdjustmentMagnitude,
      };
    };

    const matchResults = rankedForSelf
      .map(findPeerFromCandidate)
      .filter((m): m is MatchResult => m !== null)
      .slice(0, 2);

    setMatches(matchResults);

    if (rankedForSelf[0]) {
      // Demo-only simulated feedback loop for phase 3 learning.
      matcher.recordOutcome({ pairId: rankedForSelf[0].id, reward: 0.75 });
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
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

        {/* NEW: Metrics Dashboard */}
        {metrics && (
          <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200 text-left max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-blue-700">Matching Cycle Metrics</h3>
              <button
                onClick={() => setShowMetricsDetail(!showMetricsDetail)}
                className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition"
              >
                {showMetricsDetail ? 'Hide' : 'Show'} Details
              </button>
            </div>
            {showMetricsDetail && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-500 text-xs">Eligible Users</p>
                  <p className="text-lg font-semibold text-blue-700">{metrics.totalProfiles}</p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-500 text-xs">Candidate Pairs</p>
                  <p className="text-lg font-semibold text-blue-700">{metrics.totalCandidates}</p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-500 text-xs">Final Matches</p>
                  <p className="text-lg font-semibold text-blue-700">{metrics.totalFinalAssignments}</p>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-gray-500 text-xs">Avg Quality</p>
                  <p className="text-lg font-semibold text-blue-700">{metrics.averageFinalScore.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Match Results */}
        {matches.length > 0 && (
          <div className="mt-8 space-y-4">
            {matches.map((match, idx) => (
              <div key={idx} className="p-5 rounded-lg bg-white shadow text-left max-w-md mx-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${idx === 0 ? 'text-indigo-700' : 'text-gray-600'}`}>
                      {idx === 0 ? '⭐ Primary Match' : '🔄 Backup Match'}
                    </h3>
                    <p className="text-lg font-medium">{match.name} <span className="text-sm text-gray-500">({match.pronouns})</span></p>
                    <p className="text-gray-600">Background: {match.background}</p>
                  </div>
                  {/* NEW: Fairness Indicator */}
                  {match.fairnessAdjusted && (
                    <div className="text-right">
                      <div className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded whitespace-nowrap">
                        ✓ Fair Matched
                      </div>
                    </div>
                  )}
                </div>

                {/* NEW: Phase Scores Breakdown */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Score Progression</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-150">
                      <p className="text-gray-500">Phase 1</p>
                      <p className="font-semibold text-blue-700">{(match.phase1Score?.toFixed(2) ?? 'N/A')}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-150">
                      <p className="text-gray-500">Phase 2</p>
                      <p className="font-semibold text-green-700">{(match.phase2Score?.toFixed(2) ?? 'N/A')}</p>
                      {match.fairnessAdjustmentMagnitude !== undefined && match.fairnessAdjustmentMagnitude !== 0 && (
                        <p className={`text-xs ${match.fairnessAdjustmentMagnitude > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {match.fairnessAdjustmentMagnitude > 0 ? '+' : ''}{match.fairnessAdjustmentMagnitude.toFixed(3)}
                        </p>
                      )}
                    </div>
                    <div className="bg-purple-50 p-2 rounded border border-purple-150">
                      <p className="text-gray-500">Phase 3</p>
                      <p className="font-semibold text-purple-700">{(match.phase3Score?.toFixed(2) ?? 'N/A')}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">All matches are anonymized. No personal data is stored or shared.</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-4">This is a demo with advanced metrics. In production, matching is privacy-preserving and peer-verified.</div>
      </div>
    </section>
  );
}
