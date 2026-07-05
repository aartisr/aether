import { randomUUID } from 'node:crypto';
import { listPeerNavigators } from '../peer-directory/peer-navigator-directory';
import { getPeerRecruitmentPersistence } from './persistence';
import {
  buildPeerId,
  type CreatePeerRecordInput,
  type UpdatePeerRecordInput,
  validateCreatePeerRecordInput,
  validateUpdatePeerRecordInput,
} from './peer-records';
import {
  applyScreeningStatus,
  applyTrainingStatus,
  applyVerificationStatus,
  transitionFromSuspendedToPaused,
  transitionToActive,
  transitionToPaused,
  transitionToSuspended,
} from './lifecycle';
import type {
  PeerIncidentCase,
  PeerLifecycleAuditEvent,
  PeerRecruitmentRecord,
  ScreeningStatus,
  TrainingStatus,
  VerificationStatus,
} from './types';

const persistence = getPeerRecruitmentPersistence();

function createSeedPeers(): PeerRecruitmentRecord[] {
  const now = new Date().toISOString();
  return listPeerNavigators().map((peer) => ({
    ...peer,
    candidate: {
      candidateId: `cand-${peer.id}`,
      source: 'seed',
      roleIntent: 'navigator',
      appliedAt: now,
    },
    lifecycleState: 'active',
    screeningStatus: 'passed',
    trainingStatus: 'complete',
    verificationStatus: 'verified',
    maxActiveMatches: 3,
    currentActiveMatches: 0,
    responseSlaHours: 24,
    createdAt: now,
    updatedAt: now,
  }));
}

async function readPeerStore(): Promise<PeerRecruitmentRecord[]> {
  const peers = await persistence.readPeers();
  if (peers.length === 0) {
    return createSeedPeers();
  }

  return peers;
}

async function writePeerStore(peers: PeerRecruitmentRecord[]): Promise<void> {
  await persistence.writePeers(peers);
}

async function appendAuditEvent(event: PeerLifecycleAuditEvent): Promise<void> {
  await persistence.appendAuditEvent(event);
}

async function readAuditEvents(): Promise<PeerLifecycleAuditEvent[]> {
  const events = await persistence.readAuditEvents();
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function readIncidentStore(): Promise<PeerIncidentCase[]> {
  return persistence.readIncidentCases();
}

async function writeIncidentStore(cases: PeerIncidentCase[]): Promise<void> {
  await persistence.writeIncidentCases(cases);
}

export async function listRecruitmentPeers(): Promise<PeerRecruitmentRecord[]> {
  return readPeerStore();
}

export async function getRecruitmentPeer(peerId: string): Promise<PeerRecruitmentRecord | undefined> {
  const peers = await readPeerStore();
  return peers.find((peer) => peer.id === peerId);
}

function ensureUniquePeerId(existingPeers: PeerRecruitmentRecord[], requested: string, fallbackName: string): string {
  const taken = new Set(existingPeers.map((peer) => peer.id));
  const base = requested.trim() || buildPeerId(fallbackName);

  if (!taken.has(base)) {
    return base;
  }

  let i = 2;
  while (taken.has(`${base}-${i}`)) {
    i += 1;
  }

  return `${base}-${i}`;
}

export async function createRecruitmentPeer(
  input: CreatePeerRecordInput,
  actorId = 'admin-ui',
  reason = 'peer record created'
): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const valid = validateCreatePeerRecordInput(input);
  const now = new Date().toISOString();
  const peerId = ensureUniquePeerId(peers, valid.id || buildPeerId(valid.name), valid.name);

  const next: PeerRecruitmentRecord = {
    id: peerId,
    name: valid.name,
    background: valid.background,
    pronouns: valid.pronouns,
    goals: [...valid.goals],
    modalities: [...valid.modalities],
    candidate: {
      candidateId: `cand-${peerId}`,
      source: valid.source,
      roleIntent: valid.roleIntent,
      appliedAt: now,
    },
    lifecycleState: 'applied',
    screeningStatus: 'not_started',
    trainingStatus: 'not_started',
    verificationStatus: 'not_started',
    maxActiveMatches: valid.maxActiveMatches,
    currentActiveMatches: 0,
    responseSlaHours: valid.responseSlaHours,
    createdAt: now,
    updatedAt: now,
  };

  peers.push(next);
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.created',
    peerId: next.id,
    previousState: 'prospect',
    nextState: next.lifecycleState,
    reason,
    actorType: 'admin',
    actorId,
    timestamp: now,
  });

  return next;
}

export async function updateRecruitmentPeer(
  peerId: string,
  patch: UpdatePeerRecordInput,
  actorId = 'admin-ui',
  reason = 'peer record updated'
): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const valid = validateUpdatePeerRecordInput(patch);

  const nextId = valid.id
    ? ensureUniquePeerId(
        peers.filter((item) => item.id !== current.id),
        valid.id,
        valid.name ?? current.name
      )
    : current.id;

  const next: PeerRecruitmentRecord = {
    ...current,
    id: nextId,
    name: valid.name ?? current.name,
    background: valid.background ?? current.background,
    pronouns: valid.pronouns ?? current.pronouns,
    goals: valid.goals ? [...valid.goals] : current.goals,
    modalities: valid.modalities ? [...valid.modalities] : current.modalities,
    maxActiveMatches: valid.maxActiveMatches ?? current.maxActiveMatches,
    currentActiveMatches: valid.currentActiveMatches ?? current.currentActiveMatches,
    responseSlaHours: valid.responseSlaHours ?? current.responseSlaHours,
    updatedAt: new Date().toISOString(),
  };

  if (next.currentActiveMatches > next.maxActiveMatches) {
    throw new Error('currentActiveMatches cannot exceed maxActiveMatches.');
  }

  peers[index] = next;
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.updated',
    peerId: next.id,
    previousState: current.lifecycleState,
    nextState: next.lifecycleState,
    reason,
    actorType: 'admin',
    actorId,
    timestamp: next.updatedAt,
  });

  return next;
}

export async function deleteRecruitmentPeer(
  peerId: string,
  actorId = 'admin-ui',
  reason = 'peer record deleted'
): Promise<void> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const incidents = await readIncidentStore();
  const hasOpenIncident = incidents.some((incident) => incident.peerId === peerId && incident.status === 'open');
  if (hasOpenIncident) {
    throw new Error(`Peer ${peerId} has open incidents and cannot be deleted.`);
  }

  const current = peers[index];
  peers.splice(index, 1);
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.deleted',
    peerId,
    previousState: current.lifecycleState,
    nextState: 'retired',
    reason,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
  });
}

export async function listRecruitmentAuditEvents(filters?: {
  eventType?: PeerLifecycleAuditEvent['eventType'];
  peerId?: string;
  actorId?: string;
}): Promise<PeerLifecycleAuditEvent[]> {
  const events = await readAuditEvents();
  return events.filter((event) => {
    if (filters?.eventType && event.eventType !== filters.eventType) return false;
    if (filters?.peerId && event.peerId !== filters.peerId) return false;
    if (filters?.actorId && event.actorId !== filters.actorId) return false;
    return true;
  });
}

export async function listPeerIncidentCases(filters?: {
  status?: PeerIncidentCase['status'];
  peerId?: string;
}): Promise<PeerIncidentCase[]> {
  const incidents = await readIncidentStore();
  return incidents
    .filter((incident) => {
      if (filters?.status && incident.status !== filters.status) return false;
      if (filters?.peerId && incident.peerId !== filters.peerId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
}

export async function activateRecruitmentPeer(peerId: string, actorId = 'admin-ui', reason?: string): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const next = transitionToActive(current);
  peers[index] = next;
  await writePeerStore(peers);

  if (current.lifecycleState !== next.lifecycleState) {
    await appendAuditEvent({
      eventId: randomUUID(),
      eventType: 'peer.activated',
      peerId,
      previousState: current.lifecycleState,
      nextState: next.lifecycleState,
      reason,
      actorType: 'admin',
      actorId,
      timestamp: new Date().toISOString(),
    });
  }

  return next;
}

export async function pauseRecruitmentPeer(peerId: string, actorId = 'admin-ui', reason?: string): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const next = transitionToPaused(current);
  peers[index] = next;
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.paused',
    peerId,
    previousState: current.lifecycleState,
    nextState: next.lifecycleState,
    reason,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
  });

  return next;
}

export async function suspendRecruitmentPeer(peerId: string, actorId = 'admin-ui', reason?: string): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const next = transitionToSuspended(current);
  peers[index] = next;
  await writePeerStore(peers);

  if (current.lifecycleState !== next.lifecycleState) {
    await appendAuditEvent({
      eventId: randomUUID(),
      eventType: 'peer.suspended',
      peerId,
      previousState: current.lifecycleState,
      nextState: next.lifecycleState,
      reason,
      actorType: 'admin',
      actorId,
      timestamp: new Date().toISOString(),
    });
  }

  return next;
}

export async function updatePeerScreeningStatus(
  peerId: string,
  status: ScreeningStatus,
  actorId = 'admin-ui',
  reason?: string
): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const next = applyScreeningStatus(current, status);
  peers[index] = next;
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.screening.updated',
    peerId,
    previousState: current.lifecycleState,
    nextState: next.lifecycleState,
    reason,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
    metadata: {
      screeningStatus: status,
    },
  });

  return next;
}

export async function updatePeerTrainingStatus(
  peerId: string,
  status: TrainingStatus,
  actorId = 'admin-ui',
  reason?: string
): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const next = applyTrainingStatus(current, status);
  peers[index] = next;
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.training.updated',
    peerId,
    previousState: current.lifecycleState,
    nextState: next.lifecycleState,
    reason,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
    metadata: {
      trainingStatus: status,
    },
  });

  return next;
}

export async function updatePeerVerificationStatus(
  peerId: string,
  status: VerificationStatus,
  actorId = 'admin-ui',
  reason?: string
): Promise<PeerRecruitmentRecord> {
  const peers = await readPeerStore();
  const index = peers.findIndex((peer) => peer.id === peerId);

  if (index < 0) {
    throw new Error(`Peer ${peerId} not found.`);
  }

  const current = peers[index];
  const next = applyVerificationStatus(current, status);
  peers[index] = next;
  await writePeerStore(peers);

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'peer.verification.updated',
    peerId,
    previousState: current.lifecycleState,
    nextState: next.lifecycleState,
    reason,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
    metadata: {
      verificationStatus: status,
    },
  });

  return next;
}

export async function openPeerIncidentCase(input: {
  peerId: string;
  severity: PeerIncidentCase['severity'];
  summary: string;
  actorId?: string;
}): Promise<PeerIncidentCase> {
  const actorId = input.actorId ?? 'admin-ui';
  const incidents = await readIncidentStore();

  const incident: PeerIncidentCase = {
    caseId: `case-${randomUUID()}`,
    peerId: input.peerId,
    severity: input.severity,
    summary: input.summary,
    status: 'open',
    openedAt: new Date().toISOString(),
    openedBy: actorId,
  };

  incidents.push(incident);
  await writeIncidentStore(incidents);

  await suspendRecruitmentPeer(input.peerId, actorId, `incident ${incident.caseId} opened`);
  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'incident.opened',
    peerId: input.peerId,
    previousState: 'suspended',
    nextState: 'suspended',
    reason: input.summary,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
    metadata: {
      caseId: incident.caseId,
      severity: incident.severity,
    },
  });

  return incident;
}

export async function resolvePeerIncidentCase(input: {
  caseId: string;
  resolutionNote: string;
  actorId?: string;
  restoreToPaused?: boolean;
}): Promise<PeerIncidentCase> {
  const actorId = input.actorId ?? 'admin-ui';
  const incidents = await readIncidentStore();
  const index = incidents.findIndex((item) => item.caseId === input.caseId);

  if (index < 0) {
    throw new Error(`Incident case ${input.caseId} not found.`);
  }

  const current = incidents[index];
  const next: PeerIncidentCase = {
    ...current,
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolvedBy: actorId,
    resolutionNote: input.resolutionNote,
  };
  incidents[index] = next;
  await writeIncidentStore(incidents);

  if (input.restoreToPaused !== false) {
    const peers = await readPeerStore();
    const peerIndex = peers.findIndex((peer) => peer.id === next.peerId);
    if (peerIndex >= 0 && peers[peerIndex].lifecycleState === 'suspended') {
      const previous = peers[peerIndex];
      const restored = transitionFromSuspendedToPaused(previous);
      peers[peerIndex] = restored;
      await writePeerStore(peers);

      await appendAuditEvent({
        eventId: randomUUID(),
        eventType: 'peer.unsuspended',
        peerId: next.peerId,
        previousState: previous.lifecycleState,
        nextState: restored.lifecycleState,
        reason: `incident ${next.caseId} resolved`,
        actorType: 'admin',
        actorId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  await appendAuditEvent({
    eventId: randomUUID(),
    eventType: 'incident.resolved',
    peerId: next.peerId,
    previousState: 'suspended',
    nextState: input.restoreToPaused === false ? 'suspended' : 'paused',
    reason: input.resolutionNote,
    actorType: 'admin',
    actorId,
    timestamp: new Date().toISOString(),
    metadata: {
      caseId: next.caseId,
    },
  });

  return next;
}
