import type { PeerNavigatorRecord } from '../peer-directory/peer-navigator-directory';

export type PeerLifecycleState =
  | 'prospect'
  | 'applied'
  | 'screened'
  | 'training_in_progress'
  | 'training_complete'
  | 'verification_pending'
  | 'verified'
  | 'active'
  | 'paused'
  | 'suspended'
  | 'retired';

export type ScreeningStatus = 'not_started' | 'passed' | 'held' | 'failed';
export type TrainingStatus = 'not_started' | 'in_progress' | 'complete' | 'expired';
export type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export type PeerCandidate = {
  candidateId: string;
  source: 'seed' | 'referral' | 'campaign' | 'event' | 'other';
  roleIntent: 'navigator' | 'seeker' | 'both';
  appliedAt: string;
};

export type ScreeningDecision = {
  decisionId: string;
  candidateId: string;
  status: ScreeningStatus;
  reasons: string[];
  policyVersion: string;
  timestamp: string;
};

export type IncidentSeverity = 'p0' | 'p1' | 'p2' | 'p3';
export type IncidentStatus = 'open' | 'resolved';

export type PeerIncidentCase = {
  caseId: string;
  peerId: string;
  severity: IncidentSeverity;
  summary: string;
  status: IncidentStatus;
  openedAt: string;
  openedBy: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
};

export type PeerRecruitmentRecord = PeerNavigatorRecord & {
  candidate: PeerCandidate;
  lifecycleState: PeerLifecycleState;
  screeningStatus: ScreeningStatus;
  trainingStatus: TrainingStatus;
  verificationStatus: VerificationStatus;
  maxActiveMatches: number;
  currentActiveMatches: number;
  responseSlaHours: number;
  createdAt: string;
  updatedAt: string;
};

export type PeerLifecycleAuditEvent = {
  eventId: string;
  eventType:
    | 'peer.created'
    | 'peer.updated'
    | 'peer.deleted'
    | 'peer.activated'
    | 'peer.paused'
    | 'peer.suspended'
    | 'peer.unsuspended'
    | 'peer.screening.updated'
    | 'peer.training.updated'
    | 'peer.verification.updated'
    | 'incident.opened'
    | 'incident.resolved';
  peerId: string;
  previousState: PeerLifecycleState;
  nextState: PeerLifecycleState;
  reason?: string;
  actorType: 'admin' | 'system';
  actorId: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
};
