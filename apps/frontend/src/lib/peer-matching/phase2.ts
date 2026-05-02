import { assignGreedy } from "./phase1";
import type { MatchAssignment, MatchProfile, PairCandidate, Phase2Config } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeShares(values: Record<string, number>) {
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values;
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    normalized[key] = value / total;
  }
  return normalized;
}

export function applyFairnessRescoring<TProfile extends MatchProfile<object>>(
  candidates: PairCandidate[],
  profiles: TProfile[],
  config: Phase2Config<TProfile>
) {
  const fairness = config.fairness;
  if (!fairness) {
    return candidates;
  }

  const maxShareDelta = fairness.maxShareDelta ?? 0.2;
  const underExposureBoost = fairness.underExposureBoost ?? 0.12;
  const overExposurePenalty = fairness.overExposurePenalty ?? 0.28;
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  const populationByGroup: Record<string, number> = {};
  for (const profile of profiles) {
    const group = fairness.groupKey(profile);
    populationByGroup[group] = (populationByGroup[group] ?? 0) + 1;
  }

  const populationShare = normalizeShares(populationByGroup);

  // Estimate candidate exposure share without order bias.
  const candidateIncidenceByGroup: Record<string, number> = {};
  for (const candidate of candidates) {
    const profileA = profileById.get(candidate.aId);
    const profileB = profileById.get(candidate.bId);
    if (!profileA || !profileB) continue;
    const groupA = fairness.groupKey(profileA);
    const groupB = fairness.groupKey(profileB);
    candidateIncidenceByGroup[groupA] = (candidateIncidenceByGroup[groupA] ?? 0) + 1;
    candidateIncidenceByGroup[groupB] = (candidateIncidenceByGroup[groupB] ?? 0) + 1;
  }
  const candidateShare = normalizeShares(candidateIncidenceByGroup);

  const rescored = candidates
    .map((candidate) => {
      const profileA = profileById.get(candidate.aId);
      const profileB = profileById.get(candidate.bId);
      if (!profileA || !profileB) {
        return candidate;
      }

      const groupA = fairness.groupKey(profileA);
      const groupB = fairness.groupKey(profileB);
      const exposureShareA = candidateShare[groupA] ?? 0;
      const exposureShareB = candidateShare[groupB] ?? 0;
      const expectedA = populationShare[groupA] ?? 0;
      const expectedB = populationShare[groupB] ?? 0;

      const overA = Math.max(0, exposureShareA - expectedA - maxShareDelta);
      const overB = Math.max(0, exposureShareB - expectedB - maxShareDelta);
      const underA = Math.max(0, expectedA - exposureShareA - maxShareDelta);
      const underB = Math.max(0, expectedB - exposureShareB - maxShareDelta);
      const penalty = clamp((overA + overB) * overExposurePenalty, 0, 0.8);
      const boost = clamp((underA + underB) * underExposureBoost, 0, 0.4);

      const phase2Score = clamp(candidate.phase1Score - penalty + boost, 0, 1);
      const reasons = [...candidate.reasons];
      if (penalty > 0) {
        reasons.push("fairness_penalty_applied");
      }
      if (boost > 0) {
        reasons.push("fairness_underexposure_boost_applied");
      }

      return {
        ...candidate,
        phase2Score,
        reasons,
      };
    })
    .sort((left, right) => right.phase2Score - left.phase2Score);

  return rescored;
}

function tryImproveBlockingPairs(assignments: MatchAssignment[], candidates: PairCandidate[]) {
  const pairById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const currentByUser = new Map<string, MatchAssignment>();
  for (const assignment of assignments) {
    currentByUser.set(assignment.aId, assignment);
    currentByUser.set(assignment.bId, assignment);
  }

  for (const candidate of candidates) {
    const left = currentByUser.get(candidate.aId);
    const right = currentByUser.get(candidate.bId);
    if (!left || !right || left.pairId === right.pairId) {
      continue;
    }

    const leftScore = pairById.get(left.pairId)?.phase2Score ?? left.score;
    const rightScore = pairById.get(right.pairId)?.phase2Score ?? right.score;
    const candidateScore = candidate.phase2Score;

    if (candidateScore <= leftScore || candidateScore <= rightScore) {
      continue;
    }

    const nextAssignments = assignments.filter(
      (assignment) => assignment.pairId !== left.pairId && assignment.pairId !== right.pairId
    );

    nextAssignments.push({
      pairId: candidate.id,
      aId: candidate.aId,
      bId: candidate.bId,
      score: candidate.phase2Score,
      stage: "phase2",
      reasons: [...candidate.reasons, "stability_refinement_swap"],
    });

    return {
      improved: true,
      assignments: nextAssignments,
    };
  }

  return {
    improved: false,
    assignments,
  };
}

function hasMultiCapacity(capacities?: Record<string, number>) {
  return Object.values(capacities ?? {}).some((capacity) => capacity > 1);
}

export function runPhase2<TProfile extends MatchProfile<object>>(
  candidates: PairCandidate[],
  profiles: TProfile[],
  config: Phase2Config<TProfile> = {},
  maxAssignments?: number,
  capacities?: Record<string, number>
) {
  const rescored = applyFairnessRescoring(candidates, profiles, config);
  const baseAssignments = assignGreedy(rescored, "phase2", maxAssignments, capacities);

  if (!config.enableStabilityRefinement || hasMultiCapacity(capacities)) {
    return {
      candidates: rescored,
      assignments: baseAssignments,
    };
  }

  let refinedAssignments = baseAssignments;
  for (let i = 0; i < 50; i += 1) {
    const step = tryImproveBlockingPairs(refinedAssignments, rescored);
    refinedAssignments = step.assignments;
    if (!step.improved) {
      break;
    }
  }
  return {
    candidates: rescored,
    assignments: refinedAssignments,
  };
}
