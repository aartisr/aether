import type { MatchAssignment, MatchProfile, PairCandidate, Phase1Config } from "./types";

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function defaultDirectedScore(source: MatchProfile, target: MatchProfile) {
  const sourceTags = String(source.attributes.tags ?? "").toLowerCase();
  const targetTags = String(target.attributes.tags ?? "").toLowerCase();
  if (!sourceTags || !targetTags) return 0.5;
  return sourceTags === targetTags ? 0.8 : 0.45;
}

function defaultReciprocalScore(sourceToTarget: number, targetToSource: number) {
  const a = clampScore(sourceToTarget);
  const b = clampScore(targetToSource);
  const denominator = a + b;
  if (denominator <= 0) return 0;
  return (2 * a * b) / denominator;
}

function pairId(aId: string, bId: string) {
  return aId < bId ? `${aId}::${bId}` : `${bId}::${aId}`;
}

function defaultHardFilter(source: MatchProfile, target: MatchProfile) {
  return source.id !== target.id;
}

function isAvailable(profile: MatchProfile) {
  return profile.isAvailable !== false;
}

export function buildPhase1Candidates<TProfile extends MatchProfile>(
  profiles: TProfile[],
  config: Phase1Config<TProfile> = {}
) {
  const hardFilter = config.hardFilter ?? defaultHardFilter;
  const directedScore = config.directedScore ?? defaultDirectedScore;
  const reciprocalScore = config.reciprocalScore ?? defaultReciprocalScore;
  const maxCandidatesPerProfile = config.maxCandidatesPerProfile ?? 50;
  const minReciprocalScore = config.minReciprocalScore ?? 0;

  const eligible = profiles.filter(isAvailable);
  const byId = new Map(eligible.map((profile) => [profile.id, profile]));
  const pairMap = new Map<string, PairCandidate>();

  for (const source of eligible) {
    const scoredTargets = eligible
      .filter((target) => hardFilter(source, target))
      .map((target) => ({
        target,
        directed: clampScore(directedScore(source, target)),
      }))
      .sort((left, right) => right.directed - left.directed)
      .slice(0, maxCandidatesPerProfile);

    for (const { target, directed } of scoredTargets) {
      const id = pairId(source.id, target.id);
      const existing = pairMap.get(id);
      if (!existing) {
        pairMap.set(id, {
          id,
          aId: source.id,
          bId: target.id,
          directedAtoB: directed,
          directedBtoA: 0,
          reciprocalScore: 0,
          phase1Score: 0,
          phase2Score: 0,
          phase3Score: 0,
          reasons: ["candidate_generated"],
        });
        continue;
      }

      if (existing.aId === source.id && existing.bId === target.id) {
        existing.directedAtoB = directed;
      } else {
        existing.directedBtoA = directed;
      }
    }
  }

  const candidates = Array.from(pairMap.values())
    .map((candidate) => {
      const profileA = byId.get(candidate.aId);
      const profileB = byId.get(candidate.bId);
      if (!profileA || !profileB) {
        return null;
      }

      const forward = candidate.directedAtoB || clampScore(directedScore(profileA, profileB));
      const reverse = candidate.directedBtoA || clampScore(directedScore(profileB, profileA));
      const reciprocal = clampScore(reciprocalScore(forward, reverse));
      return {
        ...candidate,
        directedAtoB: forward,
        directedBtoA: reverse,
        reciprocalScore: reciprocal,
        phase1Score: reciprocal,
        phase2Score: reciprocal,
        phase3Score: reciprocal,
      };
    })
    .filter((candidate): candidate is PairCandidate => candidate !== null)
    .filter((candidate) => candidate.phase1Score >= minReciprocalScore)
    .sort((left, right) => right.phase1Score - left.phase1Score);

  return candidates;
}

export function assignGreedy(
  candidates: PairCandidate[],
  stage: MatchAssignment["stage"],
  maxAssignments?: number,
  capacities?: Record<string, number>
) {
  const used = new Map<string, number>();
  const maxCap = (profileId: string) => Math.max(1, capacities?.[profileId] ?? 1);
  const assignments: MatchAssignment[] = [];

  for (const candidate of candidates) {
    const usedA = used.get(candidate.aId) ?? 0;
    const usedB = used.get(candidate.bId) ?? 0;
    if (usedA >= maxCap(candidate.aId) || usedB >= maxCap(candidate.bId)) {
      continue;
    }

    used.set(candidate.aId, usedA + 1);
    used.set(candidate.bId, usedB + 1);
    assignments.push({
      pairId: candidate.id,
      aId: candidate.aId,
      bId: candidate.bId,
      score:
        stage === "phase1"
          ? candidate.phase1Score
          : stage === "phase2"
          ? candidate.phase2Score
          : candidate.phase3Score,
      stage,
      reasons: [...candidate.reasons],
    });

    if (maxAssignments && assignments.length >= maxAssignments) {
      break;
    }
  }

  return assignments;
}
