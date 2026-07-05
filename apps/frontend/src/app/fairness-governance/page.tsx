import React from 'react';
import FairnessAuditDashboard, {
  generateMockFairnessData,
} from '../../components/FairnessAuditDashboard';
import { getRecruitmentFairnessSnapshot } from '../../lib/peer-recruitment/fairness';

/**
 * Fairness Governance Page
 *
 * Displays the fairness audit dashboard and governance information
 * for the peer matching system. This page is designed for policy reviews
 * and system transparency.
 */

export default async function FairnessGovernancePage() {
  const data = await getRecruitmentFairnessSnapshot().catch(() => generateMockFairnessData());
  const { metrics, auditLog, policy, generatedAt } = data;
  const totalMatches = 'totalMatches' in data ? data.totalMatches : metrics.reduce((sum, m) => sum + m.matchCount, 0);
  const totalCycles = 'totalCycles' in data ? data.totalCycles : Math.ceil(totalMatches / 5);

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
