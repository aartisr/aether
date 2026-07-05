import type { PeerIncidentCase, PeerLifecycleAuditEvent, PeerRecruitmentRecord } from './types';
import type { PeerRecruitmentPersistence } from './persistence';

export function createMemoryPeerRecruitmentPersistence(): PeerRecruitmentPersistence {
  const peers: PeerRecruitmentRecord[] = [];
  const auditEvents: PeerLifecycleAuditEvent[] = [];
  const incidents: PeerIncidentCase[] = [];

  return {
    async readPeers(): Promise<PeerRecruitmentRecord[]> {
      return structuredClone(peers);
    },

    async writePeers(nextPeers: PeerRecruitmentRecord[]): Promise<void> {
      peers.splice(0, peers.length, ...structuredClone(nextPeers));
    },

    async appendAuditEvent(event: PeerLifecycleAuditEvent): Promise<void> {
      auditEvents.push(structuredClone(event));
    },

    async readAuditEvents(): Promise<PeerLifecycleAuditEvent[]> {
      return structuredClone(auditEvents);
    },

    async readIncidentCases(): Promise<PeerIncidentCase[]> {
      return structuredClone(incidents);
    },

    async writeIncidentCases(nextCases: PeerIncidentCase[]): Promise<void> {
      incidents.splice(0, incidents.length, ...structuredClone(nextCases));
    },
  };
}
