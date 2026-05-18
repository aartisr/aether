'use client';

import React from 'react';
import FairnessAuditDashboard, {
  generateMockFairnessData,
} from '../../components/FairnessAuditDashboard';

/**
 * Fairness Governance Page
 *
 * Displays the fairness audit dashboard and governance information
 * for the peer matching system. This page is designed for policy reviews
 * and system transparency.
 */

export default function FairnessGovernancePage() {
  const { metrics, auditLog, policy, generatedAt } = generateMockFairnessData();

  const totalMatches = metrics.reduce((sum, m) => sum + m.matchCount, 0);
  const totalCycles = Math.ceil(totalMatches / 5); // Assume ~5 matches per cycle

  return (
    <FairnessAuditDashboard
      metrics={metrics}
      auditLog={auditLog}
      policy={policy}
      totalMatches={totalMatches}
      totalCycles={totalCycles}
      lastUpdated={generatedAt}
    />
  );
}
