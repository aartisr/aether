export type MatchScalar = string | number | boolean | null | undefined;

export type MatchAttributes = Record<string, MatchScalar>;

export interface MatchProfile<TAttributes extends MatchAttributes = MatchAttributes> {
  id: string;
  attributes: TAttributes;
  isAvailable?: boolean;
  capacity?: number;
}

export interface PairCandidate {
  id: string;
  aId: string;
  bId: string;
  directedAtoB: number;
  directedBtoA: number;
  reciprocalScore: number;
  phase1Score: number;
  phase2Score: number;
  phase3Score: number;
  reasons: string[];
}

export interface MatchAssignment {
  pairId: string;
  aId: string;
  bId: string;
  score: number;
  stage: "phase1" | "phase2" | "phase3";
  reasons: string[];
}

export interface Phase1Config<TProfile extends MatchProfile = MatchProfile> {
  maxCandidatesPerProfile?: number;
  hardFilter?: (source: TProfile, target: TProfile) => boolean;
  directedScore?: (source: TProfile, target: TProfile) => number;
  reciprocalScore?: (sourceToTarget: number, targetToSource: number) => number;
  minReciprocalScore?: number;
}

export interface FairnessConfig<TProfile extends MatchProfile = MatchProfile> {
  groupKey: (profile: TProfile) => string;
  maxShareDelta?: number;
  underExposureBoost?: number;
  overExposurePenalty?: number;
}

export interface Phase2Config<TProfile extends MatchProfile = MatchProfile> {
  enableStabilityRefinement?: boolean;
  fairness?: FairnessConfig<TProfile>;
}

export interface BanditArmState {
  alpha: number;
  beta: number;
  seen: number;
}

export interface BanditStore {
  byPairId: Record<string, BanditArmState>;
}

export interface Phase3Config {
  qualityFloor?: number;
  explorationWeight?: number;
  uncertaintyWeight?: number;
  randomJitter?: number;
  rng?: () => number;
  rngSeed?: number;
}

export interface MatchEngineConfig<TProfile extends MatchProfile = MatchProfile> {
  phase1?: Phase1Config<TProfile>;
  phase2?: Phase2Config<TProfile>;
  phase3?: Phase3Config;
}

export interface MatchRuntimeOptions {
  phase?: "phase1" | "phase2" | "phase3";
  maxAssignments?: number;
}

export interface MatchCycleOutput {
  candidates: PairCandidate[];
  phase1Assignments: MatchAssignment[];
  phase2Assignments: MatchAssignment[];
  phase3Assignments: MatchAssignment[];
  finalAssignments: MatchAssignment[];
  metrics: {
    totalProfiles: number;
    totalCandidates: number;
    totalFinalAssignments: number;
    averageFinalScore: number;
  };
}

export interface MatchOutcomeEvent {
  pairId: string;
  reward: number;
}
