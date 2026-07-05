import fs from 'node:fs/promises';
import path from 'node:path';
import type { PeerIncidentCase, PeerLifecycleAuditEvent, PeerRecruitmentRecord } from './types';
import type { PeerRecruitmentPersistence } from './persistence';

function getPeerStorePath() {
  return path.resolve(
    process.env.PEER_RECRUITMENT_STORE_PATH ?? path.join(process.cwd(), '.data', 'peer-recruitment-peers.json')
  );
}

function getPeerAuditStorePath() {
  return path.resolve(
    process.env.PEER_RECRUITMENT_AUDIT_PATH ?? path.join(process.cwd(), '.data', 'peer-recruitment-audit.jsonl')
  );
}

function getPeerIncidentStorePath() {
  return path.resolve(
    process.env.PEER_RECRUITMENT_INCIDENT_PATH ?? path.join(process.cwd(), '.data', 'peer-recruitment-incidents.json')
  );
}

export function createFilePeerRecruitmentPersistence(): PeerRecruitmentPersistence {
  return {
    async readPeers(): Promise<PeerRecruitmentRecord[]> {
      const storePath = getPeerStorePath();
      try {
        const raw = await fs.readFile(storePath, 'utf8');
        const parsed = JSON.parse(raw) as PeerRecruitmentRecord[];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    },

    async writePeers(peers: PeerRecruitmentRecord[]): Promise<void> {
      const storePath = getPeerStorePath();
      await fs.mkdir(path.dirname(storePath), { recursive: true });
      await fs.writeFile(storePath, JSON.stringify(peers, null, 2), 'utf8');
    },

    async appendAuditEvent(event: PeerLifecycleAuditEvent): Promise<void> {
      const storePath = getPeerAuditStorePath();
      await fs.mkdir(path.dirname(storePath), { recursive: true });
      await fs.appendFile(storePath, `${JSON.stringify(event)}\n`, 'utf8');
    },

    async readAuditEvents(): Promise<PeerLifecycleAuditEvent[]> {
      const storePath = getPeerAuditStorePath();
      try {
        const raw = await fs.readFile(storePath, 'utf8');
        return raw
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => JSON.parse(line) as PeerLifecycleAuditEvent);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    },

    async readIncidentCases(): Promise<PeerIncidentCase[]> {
      const storePath = getPeerIncidentStorePath();
      try {
        const raw = await fs.readFile(storePath, 'utf8');
        const parsed = JSON.parse(raw) as PeerIncidentCase[];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return [];
        }
        throw error;
      }
    },

    async writeIncidentCases(cases: PeerIncidentCase[]): Promise<void> {
      const storePath = getPeerIncidentStorePath();
      await fs.mkdir(path.dirname(storePath), { recursive: true });
      await fs.writeFile(storePath, JSON.stringify(cases, null, 2), 'utf8');
    },
  };
}
