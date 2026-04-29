"use client";
import React, { useState } from 'react';

import { PageBackdrop, PageContainer, PageHero, SurfaceCard } from '../../components/page/PagePrimitives';
import {
  createPeerNavigatorMatcher,
  peerNavigatorBackgrounds,
  runPeerNavigatorMatch,
  type PeerNavigatorMatchResult,
  type PeerNavigatorMetrics,
} from '../../lib/peer-navigator-demo';

const matcher = createPeerNavigatorMatcher();

export default function PeerNavigator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<PeerNavigatorMatchResult[]>([]);
  const [metrics, setMetrics] = useState<PeerNavigatorMetrics | null>(null);
  const [showMetricsDetail, setShowMetricsDetail] = useState(false);

  const handleMatch = () => {
    if (!selected) return;

    const result = runPeerNavigatorMatch(selected, matcher);
    setMetrics(result.metrics);
    setMatches(result.matches);
  };

  return (
    <PageBackdrop>
      <PageContainer className="max-w-3xl text-center">
        <PageHero
          kicker="Belonging Support"
          title="Peer-Navigator Network"
          description="Connect with peers who share relevant lived context and build support pathways in a privacy-aware matching flow."
        />
        <SurfaceCard>
        
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
            {peerNavigatorBackgrounds.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
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
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left max-w-2xl mx-auto">
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
        </SurfaceCard>
      </PageContainer>
    </PageBackdrop>
  );
}
