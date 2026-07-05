import type {
  PeerLifecycleState,
  PeerRecruitmentRecord,
  ScreeningStatus,
  TrainingStatus,
  VerificationStatus,
} from './types';

export class PeerLifecycleTransitionError extends Error {
  readonly code: 'state_transition_invalid' | 'policy_violation';

  constructor(code: 'state_transition_invalid' | 'policy_violation', message: string) {
    super(message);
    this.code = code;
  }
}

function assertCanActivate(peer: PeerRecruitmentRecord): void {
  if (peer.lifecycleState === 'active') {
    return;
  }

  const allowedStates: PeerLifecycleState[] = ['paused', 'verified'];
  if (!allowedStates.includes(peer.lifecycleState)) {
    throw new PeerLifecycleTransitionError(
      'state_transition_invalid',
      `Cannot activate peer from state ${peer.lifecycleState}.`
    );
  }

  if (peer.screeningStatus !== 'passed') {
    throw new PeerLifecycleTransitionError('policy_violation', 'Peer must pass screening before activation.');
  }

  if (peer.trainingStatus !== 'complete') {
    throw new PeerLifecycleTransitionError('policy_violation', 'Peer must complete training before activation.');
  }

  if (peer.verificationStatus !== 'verified') {
    throw new PeerLifecycleTransitionError('policy_violation', 'Peer must be verified before activation.');
  }

  if (peer.maxActiveMatches < 1) {
    throw new PeerLifecycleTransitionError('policy_violation', 'Peer maxActiveMatches must be at least 1.');
  }
}

function assertCanPause(peer: PeerRecruitmentRecord): void {
  if (peer.lifecycleState !== 'active') {
    throw new PeerLifecycleTransitionError(
      'state_transition_invalid',
      `Cannot pause peer from state ${peer.lifecycleState}.`
    );
  }
}

function assertCanSuspend(peer: PeerRecruitmentRecord): void {
  if (peer.lifecycleState === 'retired') {
    throw new PeerLifecycleTransitionError('state_transition_invalid', 'Cannot suspend a retired peer.');
  }
}

function assertCanUnsuspend(peer: PeerRecruitmentRecord): void {
  if (peer.lifecycleState !== 'suspended') {
    throw new PeerLifecycleTransitionError('state_transition_invalid', 'Cannot unsuspend a non-suspended peer.');
  }
}

export function transitionToActive(peer: PeerRecruitmentRecord): PeerRecruitmentRecord {
  assertCanActivate(peer);
  if (peer.lifecycleState === 'active') return peer;

  return {
    ...peer,
    lifecycleState: 'active',
    updatedAt: new Date().toISOString(),
  };
}

export function transitionToPaused(peer: PeerRecruitmentRecord): PeerRecruitmentRecord {
  assertCanPause(peer);

  return {
    ...peer,
    lifecycleState: 'paused',
    updatedAt: new Date().toISOString(),
  };
}

export function transitionToSuspended(peer: PeerRecruitmentRecord): PeerRecruitmentRecord {
  assertCanSuspend(peer);
  if (peer.lifecycleState === 'suspended') return peer;

  return {
    ...peer,
    lifecycleState: 'suspended',
    updatedAt: new Date().toISOString(),
  };
}

export function transitionFromSuspendedToPaused(peer: PeerRecruitmentRecord): PeerRecruitmentRecord {
  assertCanUnsuspend(peer);

  return {
    ...peer,
    lifecycleState: 'paused',
    updatedAt: new Date().toISOString(),
  };
}

export function applyScreeningStatus(
  peer: PeerRecruitmentRecord,
  status: ScreeningStatus
): PeerRecruitmentRecord {
  if (status === peer.screeningStatus) return peer;

  const next: PeerRecruitmentRecord = {
    ...peer,
    screeningStatus: status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'passed' && (next.lifecycleState === 'prospect' || next.lifecycleState === 'applied')) {
    next.lifecycleState = 'screened';
  }

  if ((status === 'held' || status === 'failed') && next.lifecycleState === 'active') {
    next.lifecycleState = 'paused';
  }

  return next;
}

export function applyTrainingStatus(peer: PeerRecruitmentRecord, status: TrainingStatus): PeerRecruitmentRecord {
  if (status === peer.trainingStatus) return peer;

  if (status === 'complete' && peer.screeningStatus !== 'passed') {
    throw new PeerLifecycleTransitionError('policy_violation', 'Cannot complete training before screening pass.');
  }

  const next: PeerRecruitmentRecord = {
    ...peer,
    trainingStatus: status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'complete' && next.lifecycleState === 'screened') {
    next.lifecycleState = 'training_complete';
  }

  return next;
}

export function applyVerificationStatus(
  peer: PeerRecruitmentRecord,
  status: VerificationStatus
): PeerRecruitmentRecord {
  if (status === peer.verificationStatus) return peer;

  if (status === 'verified' && (peer.screeningStatus !== 'passed' || peer.trainingStatus !== 'complete')) {
    throw new PeerLifecycleTransitionError(
      'policy_violation',
      'Cannot verify peer before screening pass and training completion.'
    );
  }

  const next: PeerRecruitmentRecord = {
    ...peer,
    verificationStatus: status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'verified' && next.lifecycleState !== 'active') {
    next.lifecycleState = 'verified';
  }

  if (status === 'rejected' && next.lifecycleState === 'active') {
    next.lifecycleState = 'paused';
  }

  return next;
}
