import { listRecruitmentPeers } from './store';
import type { PeerRecruitmentRecord } from './types';

export type ForecastConstraintInput = {
  horizonDays?: 7 | 14 | 30;
  dailyIncomingMatchDemand?: number;
  maxNewPeerBudget?: number;
  maxTrainingCompletions?: number;
  maxVerifications?: number;
};

export type OptimizationAction = {
  action: 'recruit_new_peers' | 'complete_training' | 'complete_verification';
  count: number;
  expectedCapacityGain: number;
  rationale: string;
};

export type RecruitmentForecast = {
  generatedAt: string;
  horizonDays: number;
  demand: {
    dailyIncomingMatchDemand: number;
    projectedDemand: number;
  };
  supply: {
    activePeers: number;
    readyPausedPeers: number;
    totalOpenSlots: number;
    projectedOpenSlots: number;
  };
  gap: {
    projectedShortfall: number;
    projectedSurplus: number;
  };
  recommendedPlan: OptimizationAction[];
};

function averageOpenSlots(peers: PeerRecruitmentRecord[]): number {
  if (peers.length === 0) {
    return 2;
  }

  const total = peers.reduce((sum, peer) => sum + Math.max(0, peer.maxActiveMatches - peer.currentActiveMatches), 0);
  return Math.max(1, total / peers.length);
}

function buildOptimizationPlan(input: {
  projectedShortfall: number;
  avgPeerSlots: number;
  trainingQueueCount: number;
  verificationQueueCount: number;
  maxNewPeerBudget: number;
  maxTrainingCompletions: number;
  maxVerifications: number;
}): OptimizationAction[] {
  let remaining = Math.max(0, input.projectedShortfall);
  const actions: OptimizationAction[] = [];

  const trainingCount = Math.min(input.trainingQueueCount, input.maxTrainingCompletions, remaining);
  if (trainingCount > 0) {
    actions.push({
      action: 'complete_training',
      count: trainingCount,
      expectedCapacityGain: trainingCount,
      rationale: 'Fastest near-term path: move screened peers through training completion.',
    });
    remaining -= trainingCount;
  }

  const verificationCount = Math.min(input.verificationQueueCount, input.maxVerifications, remaining);
  if (verificationCount > 0) {
    actions.push({
      action: 'complete_verification',
      count: verificationCount,
      expectedCapacityGain: verificationCount,
      rationale: 'Unlock deployment-ready peers by clearing verification backlog.',
    });
    remaining -= verificationCount;
  }

  const recruitCount = Math.min(input.maxNewPeerBudget, Math.ceil(remaining / Math.max(1, input.avgPeerSlots)));
  if (recruitCount > 0) {
    actions.push({
      action: 'recruit_new_peers',
      count: recruitCount,
      expectedCapacityGain: Math.round(recruitCount * input.avgPeerSlots),
      rationale: 'Fill remaining demand-capacity gap through targeted recruitment campaigns.',
    });
  }

  return actions;
}

export async function getRecruitmentForecast(input: ForecastConstraintInput = {}): Promise<RecruitmentForecast> {
  const horizonDays = input.horizonDays ?? 14;
  const dailyIncomingMatchDemand = input.dailyIncomingMatchDemand ?? Number(process.env.PEER_RECRUITMENT_DAILY_DEMAND ?? 5);
  const maxNewPeerBudget = input.maxNewPeerBudget ?? Number(process.env.PEER_RECRUITMENT_MAX_NEW_PEERS ?? 12);
  const maxTrainingCompletions = input.maxTrainingCompletions ?? Number(process.env.PEER_RECRUITMENT_MAX_TRAINING_COMPLETIONS ?? 10);
  const maxVerifications = input.maxVerifications ?? Number(process.env.PEER_RECRUITMENT_MAX_VERIFICATIONS ?? 10);

  const peers = await listRecruitmentPeers();

  const activePeers = peers.filter((peer) => peer.lifecycleState === 'active');
  const readyPausedPeers = peers.filter(
    (peer) =>
      peer.lifecycleState === 'paused' &&
      peer.screeningStatus === 'passed' &&
      peer.trainingStatus === 'complete' &&
      peer.verificationStatus === 'verified'
  );

  const trainingQueueCount = peers.filter((peer) => peer.screeningStatus === 'passed' && peer.trainingStatus !== 'complete').length;
  const verificationQueueCount = peers.filter(
    (peer) => peer.screeningStatus === 'passed' && peer.trainingStatus === 'complete' && peer.verificationStatus !== 'verified'
  ).length;

  const currentOpenSlots = activePeers.reduce(
    (sum, peer) => sum + Math.max(0, peer.maxActiveMatches - peer.currentActiveMatches),
    0
  );

  const avgPeerSlots = averageOpenSlots(activePeers.length > 0 ? activePeers : peers);
  const projectedOpenSlots = currentOpenSlots + Math.round(readyPausedPeers.length * avgPeerSlots);

  const projectedDemand = Math.max(0, Math.round(dailyIncomingMatchDemand * horizonDays));
  const projectedShortfall = Math.max(0, projectedDemand - projectedOpenSlots);
  const projectedSurplus = Math.max(0, projectedOpenSlots - projectedDemand);

  const recommendedPlan = buildOptimizationPlan({
    projectedShortfall,
    avgPeerSlots,
    trainingQueueCount,
    verificationQueueCount,
    maxNewPeerBudget,
    maxTrainingCompletions,
    maxVerifications,
  });

  return {
    generatedAt: new Date().toISOString(),
    horizonDays,
    demand: {
      dailyIncomingMatchDemand,
      projectedDemand,
    },
    supply: {
      activePeers: activePeers.length,
      readyPausedPeers: readyPausedPeers.length,
      totalOpenSlots: currentOpenSlots,
      projectedOpenSlots,
    },
    gap: {
      projectedShortfall,
      projectedSurplus,
    },
    recommendedPlan,
  };
}
