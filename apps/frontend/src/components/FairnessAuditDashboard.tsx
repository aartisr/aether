'use client';

import React, { useState } from 'react';

/**
 * FairnessAuditDashboard
 *
 * Displays fairness metrics, exposure parity, and audit trails
 * for peer matching system governance and transparency.
 *
 * Features:
 * - Cohort exposure parity metrics
 * - Quality parity by cohort
 * - Fairness adjustment audit trail
 * - Historical trends
 * - Policy compliance indicators
 */

interface FairnessMetrics {
  cohort: string;
  populationShare: number;
  candidateExposure: number;
  matchExposure: number;
  exposureParity: number;
  averageQuality: number;
  qualityAboveFloor: number;
  matchCount: number;
  fairnessAdjustmentCount: number;
  avgAdjustmentMagnitude: number;
}

interface AuditLogEntry {
  timestamp: string;
  cycleId: string;
  userA: string;
  userB: string;
  cohortA: string;
  cohortB: string;
  phase1Score: number;
  phase2Score: number;
  fairnessAdjustment: number;
  adjustmentReason: string;
  finalScore: number;
  matchAccepted: boolean;
}

interface FairnessPolicy {
  exposureParityBand: number;
  underExposureBoost: number;
  overExposurePenalty: number;
  qualityFloor: number;
  version: string;
  lastReviewDate: string;
  reviewer: string;
  approvalStatus: 'approved' | 'under-review' | 'rejected';
}

interface FairnessAuditDashboardProps {
  metrics: FairnessMetrics[];
  auditLog: AuditLogEntry[];
  policy: FairnessPolicy;
  totalMatches: number;
  totalCycles: number;
  lastUpdated: string;
}

export default function FairnessAuditDashboard({
  metrics,
  auditLog,
  policy,
  totalMatches,
  totalCycles,
  lastUpdated,
}: FairnessAuditDashboardProps) {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [showAuditDetail, setShowAuditDetail] = useState(false);

  // Calculate policy compliance
  const parityCompliant = metrics.filter(
    (m) => Math.abs(m.exposureParity) <= policy.exposureParityBand
  ).length;
  const parityComplianceRate = (parityCompliant / metrics.length) * 100;

  const qualityCompliant = metrics.filter(
    (m) => m.qualityAboveFloor >= 0.9 * m.matchCount
  ).length;
  const qualityComplianceRate = (qualityCompliant / metrics.length) * 100;

  // Filter audit log
  const filteredAuditLog = selectedCohort
    ? auditLog.filter((entry) => entry.cohortA === selectedCohort || entry.cohortB === selectedCohort)
    : auditLog;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2 sm:text-4xl">Fairness Audit Dashboard</h1>
          <p className="text-amber-700">Peer Matching System Governance & Transparency</p>
        </div>

        {/* Policy Status */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Policy Version</p>
              <p className="break-words text-lg font-semibold text-amber-900">{policy.version}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${
                policy.approvalStatus === 'approved' ? 'text-green-700' :
                policy.approvalStatus === 'under-review' ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                {policy.approvalStatus.charAt(0).toUpperCase() + policy.approvalStatus.slice(1)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Last Review</p>
              <p className="break-words text-lg font-semibold text-amber-900">{policy.lastReviewDate}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Reviewer</p>
              <p className="break-all text-lg font-semibold text-amber-900">{policy.reviewer}</p>
            </div>
          </div>
        </div>

        {/* Compliance Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Exposure Parity Compliance</h3>
            <p className="text-3xl font-bold text-blue-700 mb-1">{parityComplianceRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">{parityCompliant} of {metrics.length} cohorts within band</p>
            <p className="text-xs text-gray-500 mt-2">Target: ±{(policy.exposureParityBand * 100).toFixed(0)}% exposure</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Quality Parity Compliance</h3>
            <p className="text-3xl font-bold text-green-700 mb-1">{qualityComplianceRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">{qualityCompliant} of {metrics.length} cohorts above floor</p>
            <p className="text-xs text-gray-500 mt-2">Floor: {(policy.qualityFloor * 100).toFixed(0)}% quality</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">System Status</h3>
            <p className="text-3xl font-bold text-purple-700 mb-1">{totalMatches}</p>
            <p className="text-xs text-gray-600">matches across {totalCycles} cycles</p>
            <p className="text-xs text-gray-500 mt-2">Fairness-adjusted: {auditLog.filter(e => e.fairnessAdjustment !== 0).length}</p>
          </div>
        </div>

        {/* Cohort Metrics Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cohort Fairness Metrics</h2>
            <p className="text-sm text-gray-600">Exposure and quality parity by demographic cohort</p>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {metrics.map((m) => {
              const isSelected = selectedCohort === m.cohort;
              const parityOk = Math.abs(m.exposureParity) <= policy.exposureParityBand;
              return (
                <button
                  key={`mobile-${m.cohort}`}
                  type="button"
                  onClick={() => setSelectedCohort(isSelected ? null : m.cohort)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    isSelected ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-sm font-semibold text-gray-900">{m.cohort}</span>
                  <span className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <span>
                      <span className="block font-semibold text-gray-500">Population</span>
                      {(m.populationShare * 100).toFixed(1)}%
                    </span>
                    <span>
                      <span className="block font-semibold text-gray-500">Match Share</span>
                      {(m.matchExposure * 100).toFixed(1)}%
                    </span>
                    <span>
                      <span className="block font-semibold text-gray-500">Parity Gap</span>
                      <span className={parityOk ? 'font-bold text-green-700' : 'font-bold text-red-700'}>
                        {parityOk ? '✓' : '✗'} {(m.exposureParity * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span>
                      <span className="block font-semibold text-gray-500">Matches</span>
                      {m.matchCount}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Cohort</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Pop. Share</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Exposure</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Match %</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Parity Gap</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Avg Quality</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Fair Adj.</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Matches</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => {
                  const isSelected = selectedCohort === m.cohort;
                  const parityOk = Math.abs(m.exposureParity) <= policy.exposureParityBand;
                  return (
                    <tr
                      key={m.cohort}
                      onClick={() => setSelectedCohort(isSelected ? null : m.cohort)}
                      className={`border-b border-gray-100 cursor-pointer transition ${
                        isSelected ? 'bg-amber-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-3 font-medium text-gray-900">{m.cohort}</td>
                      <td className="px-6 py-3 text-center text-gray-600">{(m.populationShare * 100).toFixed(1)}%</td>
                      <td className="px-6 py-3 text-center text-gray-600">{(m.candidateExposure * 100).toFixed(1)}%</td>
                      <td className="px-6 py-3 text-center text-gray-600">{(m.matchExposure * 100).toFixed(1)}%</td>
                      <td className={`px-6 py-3 text-center font-semibold ${
                        parityOk ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {parityOk ? '✓' : '✗'} {(m.exposureParity * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-center text-gray-600">{(m.averageQuality * 100).toFixed(0)}%</td>
                      <td className="px-6 py-3 text-center">
                        {m.fairnessAdjustmentCount > 0 ? (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {m.fairnessAdjustmentCount} ({(m.avgAdjustmentMagnitude * 100).toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-900 font-semibold">{m.matchCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
              <p className="text-sm text-gray-600">Recent fairness-adjusted matches</p>
            </div>
            <button
              onClick={() => setShowAuditDetail(!showAuditDetail)}
              className="text-sm px-3 py-1 bg-amber-200 text-amber-900 rounded hover:bg-amber-300 transition"
            >
              {showAuditDetail ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showAuditDetail && (
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {filteredAuditLog.slice(0, 20).map((entry, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Cycle</p>
                      <p className="font-mono text-xs">{entry.cycleId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Users</p>
                      <p className="text-xs">
                        <span className="font-semibold">{entry.userA}</span>
                        {' ↔ '}
                        <span className="font-semibold">{entry.userB}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Cohorts</p>
                      <p className="text-xs">{entry.cohortA} ↔ {entry.cohortB}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Status</p>
                      <p className={`font-semibold text-xs ${entry.matchAccepted ? 'text-green-700' : 'text-gray-600'}`}>
                        {entry.matchAccepted ? '✓ Accepted' : '○ Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-4 gap-3 text-xs">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-gray-600">Phase 1</p>
                      <p className="font-mono font-semibold text-blue-700">{entry.phase1Score.toFixed(3)}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-gray-600">Phase 2</p>
                      <p className="font-mono font-semibold text-green-700">{entry.phase2Score.toFixed(3)}</p>
                    </div>
                    <div className={`${entry.fairnessAdjustment !== 0 ? 'bg-amber-50' : 'bg-gray-50'} p-2 rounded`}>
                      <p className="text-gray-600">Adjustment</p>
                      <p className={`font-mono font-semibold ${entry.fairnessAdjustment > 0 ? 'text-green-700' : entry.fairnessAdjustment < 0 ? 'text-red-700' : 'text-gray-600'}`}>
                        {entry.fairnessAdjustment > 0 ? '+' : ''}{entry.fairnessAdjustment.toFixed(3)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <p className="text-gray-600">Final</p>
                      <p className="font-mono font-semibold text-purple-700">{entry.finalScore.toFixed(3)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-semibold">Reason:</span> {entry.adjustmentReason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Policy Parameters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Policy Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Exposure Parity Band</span>
                <span className="text-lg font-semibold text-gray-900">±{(policy.exposureParityBand * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Under-exposure Boost</span>
                <span className="text-lg font-semibold text-green-700">+{(policy.underExposureBoost * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Over-exposure Penalty</span>
                <span className="text-lg font-semibold text-red-700">−{(policy.overExposurePenalty * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-700 font-medium">Quality Floor</span>
                <span className="text-lg font-semibold text-gray-900">{(policy.qualityFloor * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 pb-4">
          <p>Last updated: {lastUpdated}</p>
          <p>All data is anonymized and aggregated. Individual user information is never exposed.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Mock data generator for demo purposes
 */
export function generateMockFairnessData() {
  const random = createSeededRandom(20260403);
  const generatedAt = '2026-04-03 16:00 UTC';
  const baseTimestamp = Date.UTC(2026, 3, 3, 16, 0, 0);
  const cohorts = [
    'First-generation College Student',
    'LGBTQ+',
    'International Student',
    'Student of Color',
    'Neurodivergent',
    'Disability Community',
  ];

  const metrics: FairnessMetrics[] = cohorts.map((cohort) => ({
    cohort,
    populationShare: 1 / cohorts.length + (random() - 0.5) * 0.05,
    candidateExposure: 1 / cohorts.length + (random() - 0.5) * 0.08,
    matchExposure: 1 / cohorts.length + (random() - 0.5) * 0.06,
    exposureParity: (random() - 0.5) * 0.1,
    averageQuality: 0.72 + random() * 0.15,
    qualityAboveFloor: Math.floor(random() * 35) + 25,
    matchCount: Math.floor(random() * 40) + 20,
    fairnessAdjustmentCount: Math.floor(random() * 8) + 2,
    avgAdjustmentMagnitude: random() * 0.08,
  }));

  const auditLog: AuditLogEntry[] = Array.from({ length: 15 }, (_, idx) => ({
    timestamp: new Date(baseTimestamp - random() * 86400000).toISOString(),
    cycleId: `cyc_${1000 + idx}`,
    userA: `u_${Math.floor(random() * 1000)}`,
    userB: `u_${Math.floor(random() * 1000)}`,
    cohortA: cohorts[Math.floor(random() * cohorts.length)],
    cohortB: cohorts[Math.floor(random() * cohorts.length)],
    phase1Score: 0.65 + random() * 0.3,
    phase2Score: 0.68 + random() * 0.28,
    fairnessAdjustment: (random() - 0.5) * 0.1,
    adjustmentReason: random() > 0.5 ? 'Under-exposure boost applied' : 'Over-exposure penalty applied',
    finalScore: 0.70 + random() * 0.2,
    matchAccepted: random() > 0.3,
  }));

  const policy: FairnessPolicy = {
    exposureParityBand: 0.15,
    underExposureBoost: 0.5,
    overExposurePenalty: 0.6,
    qualityFloor: 0.35,
    version: '2026-04-03-v1.0',
    lastReviewDate: '2026-04-03',
    reviewer: 'fairness-committee@aether.org',
    approvalStatus: 'approved',
  };

  return { metrics, auditLog, policy, generatedAt };
}

function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  return function seededRandom() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
