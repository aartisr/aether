import {
  createPeerNetworkMatchingEngine,
  explainPeerNetworkMatch,
} from './matching-adapter';
import type { PeerAvailabilityWindow, PeerNetworkProfile } from './types';

const mondayEvening: PeerAvailabilityWindow = {
  dayOfWeek: 1,
  startMinute: 18 * 60,
  endMinute: 20 * 60,
  timezone: 'America/New_York',
};

function createSeeker(overrides: Partial<PeerNetworkProfile> = {}): PeerNetworkProfile {
  return {
    id: 'seeker-1',
    roles: ['seeker'],
    displayName: 'Seeker',
    languages: ['English'],
    modalities: ['chat'],
    availabilityWindows: [mondayEvening],
    supportGoals: ['belonging'],
    supportStyles: ['planning'],
    identityTags: ['first-generation'],
    livedExperienceTags: ['transfer-student'],
    privacy: {
      useSensitiveForMatching: true,
      showSensitiveToMatch: false,
    },
    seeker: {
      currentNeed: 'Find someone who understands the transition',
      urgencyBand: 'not_urgent',
    },
    ...overrides,
  };
}

function createNavigator(overrides: Partial<PeerNetworkProfile> = {}): PeerNetworkProfile {
  return {
    id: 'navigator-1',
    roles: ['navigator'],
    displayName: 'Navigator',
    languages: ['english'],
    modalities: ['chat', 'video'],
    availabilityWindows: [mondayEvening],
    supportGoals: [],
    supportStyles: ['planning', 'resources'],
    identityTags: ['first-generation'],
    livedExperienceTags: ['transfer-student'],
    privacy: {
      useSensitiveForMatching: true,
      showSensitiveToMatch: false,
    },
    navigator: {
      status: 'active',
      trainingStatus: 'complete',
      verificationStatus: 'approved',
      topicsCanSupport: ['belonging'],
      topicsCannotSupport: ['crisis'],
      maxActiveMatches: 2,
      currentActiveMatches: 0,
    },
    ...overrides,
  };
}

describe('peer network matching adapter', () => {
  it('matches seekers only with active, trained, verified navigators who have capacity', () => {
    const seeker = createSeeker();
    const activeNavigator = createNavigator();
    const pausedNavigator = createNavigator({
      id: 'navigator-paused',
      navigator: {
        ...createNavigator().navigator!,
        status: 'paused',
      },
    });
    const fullNavigator = createNavigator({
      id: 'navigator-full',
      navigator: {
        ...createNavigator().navigator!,
        maxActiveMatches: 1,
        currentActiveMatches: 1,
      },
    });

    const engine = createPeerNetworkMatchingEngine({
      phase3: {
        explorationWeight: 0,
        randomJitter: 0,
      },
    });

    const output = engine.match([seeker, activeNavigator, pausedNavigator, fullNavigator], {
      phase: 'phase1',
      maxAssignments: 3,
    });

    expect(output.finalAssignments).toHaveLength(1);
    expect(output.finalAssignments[0]).toMatchObject({
      aId: 'seeker-1',
      bId: 'navigator-1',
    });
  });

  it('routes immediate-danger seekers away from peer matching', () => {
    const seeker = createSeeker({
      seeker: {
        currentNeed: 'I need help right now',
        urgencyBand: 'immediate_danger',
      },
    });
    const navigator = createNavigator();
    const engine = createPeerNetworkMatchingEngine();

    const output = engine.match([seeker, navigator], { phase: 'phase1' });

    expect(output.candidates).toHaveLength(0);
    expect(output.finalAssignments).toHaveLength(0);
  });

  it('returns safe explanation factors without exposing raw sensitive tags', () => {
    const factors = explainPeerNetworkMatch(createSeeker(), createNavigator());
    const explanation = factors.join(' ');

    expect(factors).toContain('Supports your selected goals');
    expect(factors).toContain('Matches an optional lived-context preference');
    expect(explanation).not.toContain('first-generation');
    expect(explanation).not.toContain('transfer-student');
  });
});
