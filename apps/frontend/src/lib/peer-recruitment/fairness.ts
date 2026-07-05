import { listPeerIncidentCases, listRecruitmentAuditEvents, listRecruitmentPeers } from './store';
import type { PeerLifecycleAuditEvent, PeerRecruitmentRecord } from './types';

type FairnessMetric = {
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
};

type AuditLogEntry = {
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
};

type FairnessPolicy = {
  exposureParityBand: number;
  underExposureBoost: number;
  overExposurePenalty: number;
  qualityFloor: number;
  version: string;
  lastReviewDate: string;
  reviewer: string;
  approvalStatus: 'approved' | 'under-review' | 'rejected';
};

export type RecruitmentFairnessSnapshot = {
  metrics: FairnessMetric[];
  auditLog: AuditLogEntry[];
  policy: FairnessPolicy;
  generatedAt: string;
  totalMatches: number;
  totalCycles: number;
};

const policy: FairnessPolicy = {
  exposureParityBand: 0.2,
  underExposureBoost: 0.12,
  overExposurePenalty: 0.28,
  qualityFloor: 0.7,
  version: 'recruitment-v1',
  lastReviewDate: new Date().toISOString().slice(0, 10),
  reviewer: 'Peer Recruitment Governance',
  approvalStatus: 'approved',
};

function scoreForRecord(peer: PeerRecruitmentRecord, hasOpenIncident: boolean): number {
  let score = 0;

  if (peer.screeningStatus === 'passed') score += 0.3;
  if (peer.trainingStatus === 'complete') score += 0.3;
  if (peer.verificationStatus === 'verified') score += 0.25;

  if (peer.lifecycleState === 'active') score += 0.15;
  else if (peer.lifecycleState === 'paused') score += 0.08;

  if (hasOpenIncident) score -= 0.18;

  return Math.max(0, Math.min(1, score));
}

function stateScore(state: PeerLifecycleAuditEvent['nextState']): number {
  switch (state) {
    case 'active':
      return 0.95;
    case 'paused':
      return 0.75;
    case 'suspended':
      return 0.35;
    case 'verified':
      return 0.7;
    default:
      return 0.55;
  }
}

function buildAuditLog(events: PeerLifecycleAuditEvent[], peersById: Map<string, PeerRecruitmentRecord>): AuditLogEntry[] {
  return events
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 40)
    .map((event) => {
      const peer = peersById.get(event.peerId);
      const cohort = peer?.background ?? 'Unknown';
      const phase1Score = stateScore(event.previousState);
      const phase2Score = stateScore(event.nextState);
      const fairnessAdjustment = phase2Score - phase1Score;

      return {
        timestamp: event.timestamp,
        cycleId: `evt-${event.eventId.slice(0, 8)}`,
        userA: event.peerId,
        userB: event.actorId,
        cohortA: cohort,
        cohortB: cohort,
        phase1Score,
        phase2Score,
        fairnessAdjustment,
        adjustmentReason: event.eventType,
        finalScore: phase2Score,
        matchAccepted: event.nextState === 'active',
      };
    });
}

export async function getRecruitmentFairnessSnapshot(): Promise<RecruitmentFairnessSnapshot> {
  const [peers, openIncidents, auditEvents] = await Promise.all([
    listRecruitmentPeers(),
    listPeerIncidentCases({ status: 'open' }),
    listRecruitmentAuditEvents(),
  ]);

  const totalPeers = peers.length || 1;
  const totalActiveMatches = peers.reduce((sum, peer) => sum + peer.currentActiveMatches, 0);
  const openIncidentPeerIds = new Set(openIncidents.map((incident) => incident.peerId));

  const peersById = new Map(peers.map((peer) => [peer.id, peer]));
  const cohorts = new Map<string, PeerRecruitmentRecord[]>();
  for (const peer of peers) {
    const cohort = peer.background || 'Unknown';
    const items = cohorts.get(cohort) ?? [];
    items.push(peer);
    cohorts.set(cohort, items);
  }

  const metrics: FairnessMetric[] = Array.from(cohorts.entries()).map(([cohort, cohortPeers]) => {
    const cohortPopulation = cohortPeers.length;
    const cohortMatches = cohortPeers.reduce((sum, peer) => sum + peer.currentActiveMatches, 0);
    const readinessCount = cohortPeers.filter(
      (peer) => peer.screeningStatus === 'passed' && peer.trainingStatus === 'complete' && peer.verificationStatus === 'verified'
    ).length;

    const qualityScores = cohortPeers.map((peer) => scoreForRecord(peer, openIncidentPeerIds.has(peer.id)));
    const qualitySum = qualityScores.reduce((sum, score) => sum + score, 0);
    const averageQuality = qualityScores.length > 0 ? qualitySum / qualityScores.length : 0;

    const qualityAboveFloor = qualityScores.filter((score) => score >= policy.qualityFloor).length;

    const cohortEventAdjustments = auditEvents
      .filter((event) => peersById.get(event.peerId)?.background === cohort)
      .map((event) => Math.abs(stateScore(event.nextState) - stateScore(event.previousState)));

    const fairnessAdjustmentCount = cohortEventAdjustments.filter((value) => value > 0).length;
    const avgAdjustmentMagnitude = cohortEventAdjustments.length
      ? cohortEventAdjustments.reduce((sum, value) => sum + value, 0) / cohortEventAdjustments.length
      : 0;

    const populationShare = cohortPopulation / totalPeers;
    const candidateExposure = readinessCount / totalPeers;
    const matchExposure = totalActiveMatches > 0 ? cohortMatches / totalActiveMatches : populationShare;

    return {
      cohort,
      populationShare,
      candidateExposure,
      matchExposure,
      exposureParity: matchExposure - populationShare,
      averageQuality,
      qualityAboveFloor,
      matchCount: cohortMatches,
      fairnessAdjustmentCount,
      avgAdjustmentMagnitude,
    };
  });

  const auditLog = buildAuditLog(auditEvents, peersById);

  return {
    metrics,
    auditLog,
    policy,
    generatedAt: new Date().toISOString(),
    totalMatches: peers.reduce((sum, peer) => sum + peer.currentActiveMatches, 0),
    totalCycles: Math.max(1, auditEvents.length),
  };
}
