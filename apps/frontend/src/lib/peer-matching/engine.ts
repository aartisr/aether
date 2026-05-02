import { assignGreedy, buildPhase1Candidates } from "./phase1";
import { runPhase2 } from "./phase2";
import { recordBanditOutcome, runPhase3 } from "./phase3";
import { toMatchProfiles } from "./profiles";
import type {
  BanditStore,
  EntityMatchEngineConfig,
  MatchEngine,
  MatchCycleOutput,
  MatchEngineConfig,
  MatchOutcomeEvent,
  MatchProfile,
  MatchRuntimeOptions,
} from "./types";
import { cloneBanditStore, createEmptyBanditStore, normalizeCapacity } from "./utils";

function buildCapacities<TProfile extends MatchProfile<object>>(
  profiles: TProfile[],
  capacity?: MatchEngineConfig<TProfile>["capacity"]
) {
  const capacities: Record<string, number> = {};
  for (const profile of profiles) {
    capacities[profile.id] = normalizeCapacity(capacity?.(profile) ?? profile.capacity, 1);
  }
  return capacities;
}

function buildMetrics(output: {
  profilesCount: number;
  candidatesCount: number;
  assignments: Array<{ score: number }>;
}) {
  const totalFinalAssignments = output.assignments.length;
  const averageFinalScore =
    totalFinalAssignments === 0
      ? 0
      : output.assignments.reduce((sum, assignment) => sum + assignment.score, 0) / totalFinalAssignments;

  return {
    totalProfiles: output.profilesCount,
    totalCandidates: output.candidatesCount,
    totalFinalAssignments,
    averageFinalScore,
  };
}

export function createMatchingEngine<TProfile extends MatchProfile<object> = MatchProfile>(
  config: MatchEngineConfig<TProfile> = {}
): MatchEngine<TProfile> {
  let store = cloneBanditStore(config.initialState?.banditStore ?? createEmptyBanditStore());

  function match(profiles: TProfile[], options: MatchRuntimeOptions = {}): MatchCycleOutput {
    const maxAssignments = options.maxAssignments ?? config.defaults?.maxAssignments;
    const requestedPhase = options.phase ?? config.defaults?.phase ?? "phase3";
    const capacities = buildCapacities(profiles, config.capacity);

    const phase1Candidates = buildPhase1Candidates(profiles, config.phase1);
    const phase1Assignments = assignGreedy(phase1Candidates, "phase1", maxAssignments, capacities);

    if (requestedPhase === "phase1") {
      return {
        candidates: phase1Candidates,
        phase1Assignments,
        phase2Assignments: phase1Assignments,
        phase3Assignments: phase1Assignments,
        finalAssignments: phase1Assignments,
        metrics: buildMetrics({
          profilesCount: profiles.length,
          candidatesCount: phase1Candidates.length,
          assignments: phase1Assignments,
        }),
      };
    }

    const phase2 = runPhase2(phase1Candidates, profiles, config.phase2, maxAssignments, capacities);
    if (requestedPhase === "phase2") {
      return {
        candidates: phase2.candidates,
        phase1Assignments,
        phase2Assignments: phase2.assignments,
        phase3Assignments: phase2.assignments,
        finalAssignments: phase2.assignments,
        metrics: buildMetrics({
          profilesCount: profiles.length,
          candidatesCount: phase2.candidates.length,
          assignments: phase2.assignments,
        }),
      };
    }

    const phase3 = runPhase3(phase2.candidates, store, config.phase3, maxAssignments, capacities);
    return {
      candidates: phase3.candidates,
      phase1Assignments,
      phase2Assignments: phase2.assignments,
      phase3Assignments: phase3.assignments,
      finalAssignments: phase3.assignments,
      metrics: buildMetrics({
        profilesCount: profiles.length,
        candidatesCount: phase3.candidates.length,
        assignments: phase3.assignments,
      }),
    };
  }

  function recordOutcome(event: MatchOutcomeEvent) {
    recordBanditOutcome(store, event.pairId, event.reward);
  }

  function snapshotStore() {
    return cloneBanditStore(store);
  }

  function restoreStore(nextStore: BanditStore) {
    store = cloneBanditStore(nextStore);
  }

  function resetStore() {
    store = createEmptyBanditStore();
  }

  return {
    match,
    recordOutcome,
    snapshotStore,
    restoreStore,
    resetStore,
  };
}

export function createEntityMatchingEngine<
  TEntity,
  TAttributes extends object = Record<string, unknown>,
>(config: EntityMatchEngineConfig<TEntity, TAttributes>): MatchEngine<TEntity> {
  const engine = createMatchingEngine<MatchProfile<TAttributes>>({
    defaults: config.defaults,
    capacity: config.capacity,
    initialState: config.initialState,
    phase1: config.phase1,
    phase2: config.phase2,
    phase3: config.phase3,
  });

  return {
    match: (entities, options) => engine.match(toMatchProfiles(entities, config.adapter), options),
    recordOutcome: engine.recordOutcome,
    snapshotStore: engine.snapshotStore,
    restoreStore: engine.restoreStore,
    resetStore: engine.resetStore,
  };
}

export function createPeerMatchingEngine<TProfile extends MatchProfile<object> = MatchProfile>(
  config: MatchEngineConfig<TProfile> = {}
) {
  return createMatchingEngine(config);
}
