import type { PeerIncidentCase, PeerLifecycleAuditEvent, PeerRecruitmentRecord } from './types';
import { createFilePeerRecruitmentPersistence } from './persistence-file';
import { createMemoryPeerRecruitmentPersistence } from './persistence-memory';
import { createPostgresPeerRecruitmentPersistence } from './persistence-postgres';

export type PeerRecruitmentPersistence = {
  readPeers: () => Promise<PeerRecruitmentRecord[]>;
  writePeers: (peers: PeerRecruitmentRecord[]) => Promise<void>;
  appendAuditEvent: (event: PeerLifecycleAuditEvent) => Promise<void>;
  readAuditEvents: () => Promise<PeerLifecycleAuditEvent[]>;
  readIncidentCases: () => Promise<PeerIncidentCase[]>;
  writeIncidentCases: (cases: PeerIncidentCase[]) => Promise<void>;
};

let persistenceInstance: PeerRecruitmentPersistence | null = null;

function createPersistence(): PeerRecruitmentPersistence {
  const driver = (process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER ?? 'file').trim().toLowerCase();

  switch (driver) {
    case 'file':
      return createFilePeerRecruitmentPersistence();
    case 'memory':
      return createMemoryPeerRecruitmentPersistence();
    case 'postgres':
      return createPostgresPeerRecruitmentPersistence();
    default:
      throw new Error(`Unsupported PEER_RECRUITMENT_PERSISTENCE_DRIVER: ${driver}`);
  }
}

export function getPeerRecruitmentPersistence(): PeerRecruitmentPersistence {
  if (!persistenceInstance) {
    persistenceInstance = createPersistence();
  }

  return persistenceInstance;
}

export function __resetPeerRecruitmentPersistenceForTests(): void {
  persistenceInstance = null;
}
