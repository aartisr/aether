export type MatchPhase = "phase1" | "phase2" | "phase3";

export type MatchScalar = string | number | boolean | null | undefined;

export type MatchAttributes = Record<string, unknown>;

export interface MatchProfile<TAttributes extends object = MatchAttributes> {
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
  stage: MatchPhase;
  reasons: string[];
}

export type DirectedScore<TProfile extends MatchProfile<object> = MatchProfile> = (
  source: TProfile,
  target: TProfile
) => number;

export type HardFilter<TProfile extends MatchProfile<object> = MatchProfile> = (
  source: TProfile,
  target: TProfile
) => boolean;

export interface Phase1Config<TProfile extends MatchProfile<object> = MatchProfile> {
  maxCandidatesPerProfile?: number;
  isAvailable?: (profile: TProfile) => boolean;
  pairId?: (source: TProfile, target: TProfile) => string;
  hardFilter?: HardFilter<TProfile>;
  directedScore?: DirectedScore<TProfile>;
  reciprocalScore?: (sourceToTarget: number, targetToSource: number) => number;
  minReciprocalScore?: number;
}

export interface FairnessConfig<TProfile extends MatchProfile<object> = MatchProfile> {
  groupKey: (profile: TProfile) => string;
  maxShareDelta?: number;
  underExposureBoost?: number;
  overExposurePenalty?: number;
}

export interface Phase2Config<TProfile extends MatchProfile<object> = MatchProfile> {
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

export interface MatchEngineState {
  banditStore?: BanditStore;
}

export type CapacityResolver<TProfile extends MatchProfile<object> = MatchProfile> = (
  profile: TProfile
) => number | null | undefined;

export interface MatchEngineConfig<TProfile extends MatchProfile<object> = MatchProfile> {
  defaults?: MatchRuntimeOptions;
  capacity?: CapacityResolver<TProfile>;
  initialState?: MatchEngineState;
  phase1?: Phase1Config<TProfile>;
  phase2?: Phase2Config<TProfile>;
  phase3?: Phase3Config;
}

export interface MatchRuntimeOptions {
  phase?: MatchPhase;
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

export interface MatchEngine<TInput> {
  match: (items: TInput[], options?: MatchRuntimeOptions) => MatchCycleOutput;
  recordOutcome: (event: MatchOutcomeEvent) => void;
  snapshotStore: () => BanditStore;
  restoreStore: (nextStore: BanditStore) => void;
  resetStore: () => void;
}

export type MatchProfileAdapter<TEntity, TAttributes extends object = MatchAttributes> =
  | ((entity: TEntity) => MatchProfile<TAttributes>)
  | {
      id: (entity: TEntity) => string;
      attributes: (entity: TEntity) => TAttributes;
      isAvailable?: (entity: TEntity) => boolean;
      capacity?: (entity: TEntity) => number | null | undefined;
    };

export interface EntityMatchEngineConfig<
  TEntity,
  TAttributes extends object = MatchAttributes,
> extends MatchEngineConfig<MatchProfile<TAttributes>> {
  adapter: MatchProfileAdapter<TEntity, TAttributes>;
}
