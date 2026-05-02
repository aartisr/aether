import { assignGreedy } from "./phase1";
import type { BanditStore, MatchAssignment, PairCandidate, Phase3Config } from "./types";
import { clampScore } from "./utils";

function ensureArm(store: BanditStore, pairId: string) {
  if (!store.byPairId[pairId]) {
    store.byPairId[pairId] = { alpha: 1, beta: 1, seen: 0 };
  }
  return store.byPairId[pairId];
}

function createSeededRandom(seed: number) {
  // Mulberry32 PRNG for deterministic simulation and reproducible tests.
  let t = seed >>> 0;
  return function seededRandom() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rerankWithConstrainedExploration(
  candidates: PairCandidate[],
  store: BanditStore,
  config: Phase3Config = {}
) {
  const qualityFloor = config.qualityFloor ?? 0.3;
  const explorationWeight = config.explorationWeight ?? 0.25;
  const uncertaintyWeight = config.uncertaintyWeight ?? 0.15;
  const randomJitter = config.randomJitter ?? 0.03;
  const random = config.rng ?? (config.rngSeed !== undefined ? createSeededRandom(config.rngSeed) : Math.random);

  const totalSeen = Object.values(store.byPairId).reduce((sum, arm) => sum + arm.seen, 0) + 1;

  const reranked = candidates
    .map((candidate) => {
      const arm = ensureArm(store, candidate.id);
      const posteriorMean = arm.alpha / (arm.alpha + arm.beta);
      const uncertainty = Math.sqrt(Math.log(totalSeen + 1) / (arm.seen + 1));
      const explorationBoost = uncertaintyWeight * uncertainty;
      const jitter = (random() * 2 - 1) * randomJitter;
      const eligibleScore = candidate.phase2Score >= qualityFloor ? candidate.phase2Score : 0;
      const blended = eligibleScore * (1 - explorationWeight) + posteriorMean * explorationWeight + explorationBoost + jitter;
      const phase3Score = clampScore(blended);

      const reasons = [...candidate.reasons];
      if (candidate.phase2Score < qualityFloor) {
        reasons.push("quality_floor_filtered");
      } else {
        reasons.push("bandit_exploration_applied");
      }

      return {
        ...candidate,
        phase3Score,
        reasons,
      };
    })
    .filter((candidate) => candidate.phase2Score >= qualityFloor)
    .sort((left, right) => right.phase3Score - left.phase3Score);

  return reranked;
}

export function runPhase3(
  candidates: PairCandidate[],
  store: BanditStore,
  config: Phase3Config = {},
  maxAssignments?: number,
  capacities?: Record<string, number>
) {
  const reranked = rerankWithConstrainedExploration(candidates, store, config);
  const assignments = assignGreedy(reranked, "phase3", maxAssignments, capacities);
  return {
    candidates: reranked,
    assignments,
  };
}

export function recordBanditOutcome(store: BanditStore, pairId: string, reward: number) {
  const arm = ensureArm(store, pairId);
  const boundedReward = clampScore(reward);
  arm.alpha += boundedReward;
  arm.beta += 1 - boundedReward;
  arm.seen += 1;
}

export function toPhase3Assignments(assignments: MatchAssignment[]) {
  return assignments.map((assignment) => ({
    ...assignment,
    stage: "phase3" as const,
  }));
}
