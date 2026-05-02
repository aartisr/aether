import {
  createEntityMatchingEngine,
  createMatchingEngine,
  createPeerMatchingEngine,
  type MatchProfile,
} from './index';

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
  it('keeps the peer-named factory as a backwards-compatible alias', () => {
    const peerEngine = createPeerMatchingEngine<MatchProfile<DemoAttributes>>();
    const genericEngine = createMatchingEngine<MatchProfile<DemoAttributes>>();

    expect(peerEngine.match(profiles, { phase: 'phase1' }).metrics.totalProfiles).toBe(
      genericEngine.match(profiles, { phase: 'phase1' }).metrics.totalProfiles
    );
  });

  it('adapts arbitrary domain entities without callers pre-wrapping MatchProfile objects', () => {
    type ProgramParticipant = {
      uid: string;
      kind: 'seeker' | 'navigator';
      active: boolean;
      goals: string[];
      canSupport: string[];
      remainingCapacity: number;
    };

    const participants: ProgramParticipant[] = [
      {
        uid: 'student-1',
        kind: 'seeker',
        active: true,
        goals: ['belonging'],
        canSupport: [],
        remainingCapacity: 1,
      },
      {
        uid: 'navigator-1',
        kind: 'navigator',
        active: true,
        goals: [],
        canSupport: ['belonging'],
        remainingCapacity: 1,
      },
      {
        uid: 'navigator-full',
        kind: 'navigator',
        active: true,
        goals: [],
        canSupport: ['belonging'],
        remainingCapacity: 0,
      },
    ];

    const engine = createEntityMatchingEngine<
      ProgramParticipant,
      {
        kind: ProgramParticipant['kind'];
        goals: string[];
        canSupport: string[];
      }
    >({
      adapter: {
        id: (participant) => participant.uid,
        isAvailable: (participant) => participant.active,
        capacity: (participant) => participant.remainingCapacity,
        attributes: (participant) => ({
          kind: participant.kind,
          goals: participant.goals,
          canSupport: participant.canSupport,
        }),
      },
      defaults: {
        phase: 'phase1',
      },
      phase1: {
        hardFilter: (source, target) =>
          source.attributes.kind === 'seeker' &&
          target.attributes.kind === 'navigator' &&
          target.capacity !== 0,
        directedScore: (source, target) => {
          if (source.attributes.kind === 'seeker') {
            return source.attributes.goals.some((goal) => target.attributes.canSupport.includes(goal))
              ? 0.95
              : 0.2;
          }

          return target.attributes.goals.some((goal) => source.attributes.canSupport.includes(goal))
            ? 0.95
            : 0.2;
        },
      },
    });

    const output = engine.match(participants);

    expect(output.finalAssignments).toHaveLength(1);
    expect(output.finalAssignments[0]).toMatchObject({
      aId: 'student-1',
      bId: 'navigator-1',
    });
  });

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

  it('can snapshot, restore, and reset exploration state', () => {
    const engine = createDemoEngine();
    const output = engine.match(profiles, { phase: 'phase3', maxAssignments: 1 });
    const assignment = output.finalAssignments[0];

    engine.recordOutcome({ pairId: assignment.pairId, reward: 1 });
    const snapshot = engine.snapshotStore();

    expect(snapshot.byPairId[assignment.pairId].seen).toBe(1);

    engine.resetStore();
    expect(engine.snapshotStore().byPairId).toEqual({});

    engine.restoreStore(snapshot);
    expect(engine.snapshotStore().byPairId[assignment.pairId].seen).toBe(1);
  });
});
