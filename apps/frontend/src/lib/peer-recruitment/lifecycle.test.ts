import { transitionToActive, transitionToPaused, PeerLifecycleTransitionError } from './lifecycle';
import type { PeerRecruitmentRecord } from './types';

function createPeer(overrides: Partial<PeerRecruitmentRecord> = {}): PeerRecruitmentRecord {
  const now = new Date().toISOString();
  return {
    id: 'nav-test',
    name: 'Test Peer',
    background: 'LGBTQ+',
    pronouns: 'they/them',
    goals: ['belonging'],
    modalities: ['chat'],
    candidate: {
      candidateId: 'cand-test',
      source: 'seed',
      roleIntent: 'navigator',
      appliedAt: now,
    },
    lifecycleState: 'paused',
    screeningStatus: 'passed',
    trainingStatus: 'complete',
    verificationStatus: 'verified',
    maxActiveMatches: 2,
    currentActiveMatches: 0,
    responseSlaHours: 24,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('peer recruitment lifecycle', () => {
  it('activates a paused peer when all hard gates pass', () => {
    const active = transitionToActive(createPeer());
    expect(active.lifecycleState).toBe('active');
  });

  it('blocks activation when training is incomplete', () => {
    expect(() => transitionToActive(createPeer({ trainingStatus: 'in_progress' }))).toThrow(PeerLifecycleTransitionError);
  });

  it('pauses an active peer', () => {
    const paused = transitionToPaused(createPeer({ lifecycleState: 'active' }));
    expect(paused.lifecycleState).toBe('paused');
  });
});
