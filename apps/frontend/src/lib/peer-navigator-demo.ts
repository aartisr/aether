/**
 * Student Support Peer Navigator
 *
 * Demonstrates plug-and-play peer matching.
 * To adapt for a new domain: copy this file, replace cohort data and buildProfiles().
 */

import { createMatchingEngine, type MatchEngine, type MatchProfile } from './peer-matching';
import { listPeerNavigators, type PeerContactModality } from './peer-directory/peer-navigator-directory';

export type PeerNavigatorRequest = {
  background: string;
  goal: string;
  modality: string;
  urgencyBand?: string;
};

export type PeerNavigatorMatchResult = {
  name: string;
  background: string;
  pronouns: string;
  explanationFactors: string[];
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

export type PeerNavigatorRunResult = {
  matches: PeerNavigatorMatchResult[];
  metrics: PeerNavigatorMetrics | null;
  triage?: {
    level: 'urgent';
    message: string;
    actionLabel: string;
    actionHref: string;
  };
};

// ===== Domain Data =====

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

export const peerNavigatorGoals = [
  'belonging',
  'academic stress',
  'focus and study rhythm',
  'sleep routines',
  'career navigation',
  'campus resources',
];

export const peerNavigatorModalities: PeerContactModality[] = ['chat', 'phone', 'video'];

const navigators = listPeerNavigators();

// ===== Profile Builder =====

function buildProfiles(request: PeerNavigatorRequest): MatchProfile[] {
  return [
    {
      id: 'self',
      capacity: 1,
      attributes: {
        background: request.background,
        goal: request.goal,
      },
    },
    ...navigators.map((nav) => ({
      id: nav.id,
      capacity: 1,
      attributes: {
        background: nav.background,
        goals: nav.goals,
        pronouns: nav.pronouns,
      },
    })),
  ];
}

// ===== Triage =====

function checkTriage(request: PeerNavigatorRequest): PeerNavigatorRunResult['triage'] | undefined {
  if (request.urgencyBand === 'immediate_danger') {
    return {
      level: 'urgent',
      message: 'Peer Navigator is not designed for immediate danger. Please use crisis support now.',
      actionLabel: 'Call or text 988',
      actionHref: 'https://988lifeline.org/',
    };
  }
  return undefined;
}

// ===== Public API =====

export function createPeerNavigatorMatcher(): MatchEngine<MatchProfile> {
  return createMatchingEngine({
    phase1: {
      maxCandidatesPerProfile: 40,
    },
  });
}

/**
 * Legacy compatibility: run with a background string.
 */
export function runPeerNavigatorMatch(
  selectedBackground: string,
  matcher: MatchEngine<MatchProfile>,
): PeerNavigatorRunResult {
  return runPeerNavigatorMatchRequest(
    {
      background: selectedBackground,
      goal: 'belonging',
      modality: 'chat',
    },
    matcher,
  );
}

/**
 * Run matching with explicit request.
 */
export function runPeerNavigatorMatchRequest(
  request: PeerNavigatorRequest,
  matcher: MatchEngine<MatchProfile>,
): PeerNavigatorRunResult {
  const triage = checkTriage(request);
  if (triage) {
    return {
      matches: [],
      metrics: null,
      triage,
    };
  }

  const profiles = buildProfiles(request);
  const output = matcher.match(profiles, {
    phase: 'phase3',
    maxAssignments: 3,
  });

  const matches: PeerNavigatorMatchResult[] = output.finalAssignments
    .map((assignment) => {
      const navigatorId = assignment.aId === 'self' ? assignment.bId : assignment.aId;
      const nav = navigators.find((n) => n.id === navigatorId);

      if (!nav) return null;

      return {
        name: nav.name,
        background: nav.background,
        pronouns: nav.pronouns,
        explanationFactors: assignment.reasons || ['Supports your goals'],
        phase3Score: assignment.score,
        fairnessAdjusted: false,
        fairnessAdjustmentMagnitude: 0,
      } as PeerNavigatorMatchResult;
    })
    .filter(Boolean) as PeerNavigatorMatchResult[];

  return {
    matches,
    metrics: output.metrics ?? null,
  };
}
