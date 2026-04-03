import { createPeerMatchingEngine, type MatchProfile } from './index';

type DemoAttributes = {
  role: 'self' | 'peer';
  background: string;
  tags?: string;
};

const profiles: MatchProfile<DemoAttributes>[] = [
  { id: 'self', attributes: { role: 'self', background: 'A' } },
  { id: 'p1', attributes: { role: 'peer', background: 'A' } },
  { id: 'p2', attributes: { role: 'peer', background: 'B' } },
  { id: 'p3', attributes: { role: 'peer', background: 'A' } },
  { id: 'p4', attributes: { role: 'peer', background: 'B' } },
];

function createDemoEngine() {
  return createPeerMatchingEngine<MatchProfile<DemoAttributes>>({
    phase1: {
      hardFilter: (source, target) => source.id !== target.id && target.attributes.role === 'peer',
      directedScore: (source, target) => {
        return source.attributes.background === target.attributes.background ? 0.95 : 0.4;
      },
    },
    phase2: {
      enableStabilityRefinement: true,
      fairness: {
        groupKey: (profile) => profile.attributes.background,
        maxShareDelta: 0.4,
      },
    },
    phase3: {
      qualityFloor: 0.3,
      explorationWeight: 0.2,
      randomJitter: 0,
      rngSeed: 42,
    },
  });
}

describe('peer matching engine phases', () => {
  it('runs phase 1 only and returns phase1 assignments', () => {
    const engine = createDemoEngine();
    const output = engine.match(profiles, { phase: 'phase1', maxAssignments: 2 });

    expect(output.phase1Assignments.length).toBeGreaterThan(0);
    expect(output.finalAssignments).toEqual(output.phase1Assignments);
  });

  it('runs phase 2 and returns fairness/stability aware assignments', () => {
    const engine = createDemoEngine();
    const output = engine.match(profiles, { phase: 'phase2', maxAssignments: 2 });

    expect(output.phase2Assignments.length).toBeGreaterThan(0);
    expect(output.finalAssignments).toEqual(output.phase2Assignments);
  });

  it('runs phase 3 and updates bandit store after outcomes', () => {
    const engine = createDemoEngine();
    const output = engine.match(profiles, { phase: 'phase3', maxAssignments: 2 });

    expect(output.phase3Assignments.length).toBeGreaterThan(0);

    const assignment = output.phase3Assignments[0];
    engine.recordOutcome({ pairId: assignment.pairId, reward: 1 });

    const snapshot = engine.snapshotStore();
    expect(snapshot.byPairId[assignment.pairId]).toBeDefined();
    expect(snapshot.byPairId[assignment.pairId].seen).toBeGreaterThan(0);
  });

  it('returns deterministic phase 3 ranking when seeded', () => {
    const engineA = createDemoEngine();
    const engineB = createDemoEngine();

    const outA = engineA.match(profiles, { phase: 'phase3', maxAssignments: 2 });
    const outB = engineB.match(profiles, { phase: 'phase3', maxAssignments: 2 });

    expect(outA.phase3Assignments).toEqual(outB.phase3Assignments);
  });

  it('respects per-profile capacity for multi-match scenarios', () => {
    const engine = createPeerMatchingEngine<MatchProfile<DemoAttributes>>({
      phase1: {
        hardFilter: (source, target) => source.id !== target.id && target.attributes.role === 'peer',
        directedScore: (source, target) => (source.attributes.background === target.attributes.background ? 0.9 : 0.45),
      },
      phase3: {
        qualityFloor: 0.2,
        explorationWeight: 0,
        randomJitter: 0,
      },
    });

    const withCapacity = profiles.map((profile) =>
      profile.id === 'self' ? { ...profile, capacity: 2 } : profile
    );

    const output = engine.match(withCapacity, { phase: 'phase1', maxAssignments: 3 });
    const selfAssignments = output.phase1Assignments.filter(
      (assignment) => assignment.aId === 'self' || assignment.bId === 'self'
    );

    expect(selfAssignments.length).toBe(2);
  });
});
