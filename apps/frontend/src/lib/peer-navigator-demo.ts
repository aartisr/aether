import { createPeerMatchingEngine, type MatchProfile } from './peer-matching';

export const peerNavigatorBackgrounds = [
  'First-generation College Student',
  'LGBTQ+',
  'International Student',
  'Student of Color',
  'Neurodivergent',
  'Disability Community',
  'Veteran',
  'Other',
];

const peerNavigatorPeers = [
  { name: 'Alex', background: 'LGBTQ+', pronouns: 'they/them' },
  { name: 'Priya', background: 'International Student', pronouns: 'she/her' },
  { name: 'Jordan', background: 'First-generation College Student', pronouns: 'he/him' },
  { name: 'Samira', background: 'Student of Color', pronouns: 'she/her' },
  { name: 'Taylor', background: 'Neurodivergent', pronouns: 'they/them' },
  { name: 'Chris', background: 'Veteran', pronouns: 'he/him' },
];

export type PeerAttributes = {
  name: string;
  background: string;
  pronouns: string;
  role: 'self' | 'peer';
};

export type PeerNavigatorMatchResult = {
  name: string;
  background: string;
  pronouns: string;
  phase1Score?: number;
  phase2Score?: number;
  phase3Score?: number;
  fairnessAdjusted?: boolean;
  fairnessAdjustmentMagnitude?: number;
};

export type PeerNavigatorMetrics = {
  totalProfiles: number;
  totalCandidates: number;
  totalFinalAssignments: number;
  averageFinalScore: number;
};

export function createPeerNavigatorMatcher() {
  return createPeerMatchingEngine<MatchProfile<PeerAttributes>>({
    phase1: {
      maxCandidatesPerProfile: 25,
      hardFilter: (source, target) => source.id !== target.id && target.attributes.role === 'peer',
      directedScore: (source, target) =>
        source.attributes.background === target.attributes.background ? 0.95 : 0.45,
      minReciprocalScore: 0.3,
    },
    phase2: {
      enableStabilityRefinement: true,
      fairness: {
        groupKey: (profile) => profile.attributes.background,
        maxShareDelta: 0.35,
        underExposureBoost: 0.5,
        overExposurePenalty: 0.6,
      },
    },
    phase3: {
      qualityFloor: 0.35,
      explorationWeight: 0.2,
      uncertaintyWeight: 0.1,
      randomJitter: 0.02,
      rngSeed: 42,
    },
  });
}

function buildPeerProfiles(selectedBackground: string): MatchProfile<PeerAttributes>[] {
  return [
    {
      id: 'self',
      attributes: {
        name: 'You',
        background: selectedBackground,
        pronouns: 'prefer not to say',
        role: 'self',
      },
      capacity: 1,
    },
    ...peerNavigatorPeers.map((peer, index) => ({
      id: `peer-${index}`,
      attributes: {
        name: peer.name,
        background: peer.background,
        pronouns: peer.pronouns,
        role: 'peer' as const,
      },
    })),
  ];
}

export function runPeerNavigatorMatch(
  selectedBackground: string,
  matcher: ReturnType<typeof createPeerNavigatorMatcher>,
): {
  matches: PeerNavigatorMatchResult[];
  metrics: PeerNavigatorMetrics | null;
} {
  const profiles = buildPeerProfiles(selectedBackground);
  const output = matcher.match(profiles, {
    phase: 'phase3',
    maxAssignments: 3,
  });

  const rankedForSelf = output.candidates
    .filter((candidate) => candidate.aId === 'self' || candidate.bId === 'self')
    .sort((left, right) => right.phase3Score - left.phase3Score);

  const matches = rankedForSelf
    .map((candidate): PeerNavigatorMatchResult | null => {
      const peerId = candidate.aId === 'self' ? candidate.bId : candidate.aId;
      const profile = profiles.find((entry) => entry.id === peerId);

      if (!profile || profile.attributes.role !== 'peer') {
        return null;
      }

      const fairnessAdjustmentMagnitude = (candidate.phase2Score ?? 0) - (candidate.phase1Score ?? 0);

      return {
        name: profile.attributes.name,
        background: profile.attributes.background,
        pronouns: profile.attributes.pronouns,
        phase1Score: candidate.phase1Score,
        phase2Score: candidate.phase2Score,
        phase3Score: candidate.phase3Score,
        fairnessAdjusted: fairnessAdjustmentMagnitude !== 0,
        fairnessAdjustmentMagnitude,
      };
    })
    .filter((match): match is PeerNavigatorMatchResult => match !== null)
    .slice(0, 2);

  if (rankedForSelf[0]) {
    matcher.recordOutcome({ pairId: rankedForSelf[0].id, reward: 0.75 });
  }

  return {
    matches,
    metrics: output.metrics ?? null,
  };
}
