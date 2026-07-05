import type { PeerIncidentCase, PeerLifecycleAuditEvent, PeerRecruitmentRecord } from './types';
import type { PeerRecruitmentPersistence } from './persistence';
import { Pool, type PoolClient } from 'pg';

type PostgresConfig = {
  connectionString?: string;
  schema: string;
  peersTable: string;
  incidentsTable: string;
  auditTable: string;
};

function getPostgresConfig(): PostgresConfig {
  return {
    connectionString: process.env.PEER_RECRUITMENT_PG_CONNECTION_STRING,
    schema: (process.env.PEER_RECRUITMENT_PG_SCHEMA ?? 'public').trim() || 'public',
    peersTable: (process.env.PEER_RECRUITMENT_PG_PEERS_TABLE ?? 'peer_recruitment_peers').trim() || 'peer_recruitment_peers',
    incidentsTable: (process.env.PEER_RECRUITMENT_PG_INCIDENTS_TABLE ?? 'peer_recruitment_incidents').trim() || 'peer_recruitment_incidents',
    auditTable: (process.env.PEER_RECRUITMENT_PG_AUDIT_TABLE ?? 'peer_recruitment_audit_events').trim() || 'peer_recruitment_audit_events',
  };
}

function quoteIdentifier(identifier: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid Postgres identifier: ${identifier}`);
  }

  return `"${identifier}"`;
}

let poolInstance: Pool | null = null;
let ensurePromise: Promise<void> | null = null;

function getPool(config: PostgresConfig): Pool {
  if (!config.connectionString) {
    throw new Error(
      'PEER_RECRUITMENT_PG_CONNECTION_STRING is required when PEER_RECRUITMENT_PERSISTENCE_DRIVER=postgres.'
    );
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: config.connectionString,
      max: Number(process.env.PEER_RECRUITMENT_PG_POOL_MAX ?? 5),
      idleTimeoutMillis: Number(process.env.PEER_RECRUITMENT_PG_IDLE_TIMEOUT_MS ?? 30_000),
    });
  }

  return poolInstance;
}

async function ensureTables(config: PostgresConfig): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const pool = getPool(config);
      const schema = quoteIdentifier(config.schema);
      const peersTable = quoteIdentifier(config.peersTable);
      const incidentsTable = quoteIdentifier(config.incidentsTable);
      const auditTable = quoteIdentifier(config.auditTable);

      await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.${peersTable} (
          peer_id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.${incidentsTable} (
          case_id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${schema}.${auditTable} (
          event_id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    })();
  }

  return ensurePromise;
}

async function withTransaction<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function createPostgresPeerRecruitmentPersistence(): PeerRecruitmentPersistence {
  const config = getPostgresConfig();
  const schema = quoteIdentifier(config.schema);
  const peersTable = quoteIdentifier(config.peersTable);
  const incidentsTable = quoteIdentifier(config.incidentsTable);
  const auditTable = quoteIdentifier(config.auditTable);

  return {
    async readPeers(): Promise<PeerRecruitmentRecord[]> {
      await ensureTables(config);
      const pool = getPool(config);
      const result = await pool.query<{ payload: PeerRecruitmentRecord }>(
        `SELECT payload FROM ${schema}.${peersTable} ORDER BY peer_id ASC`
      );
      return result.rows.map((row) => row.payload);
    },

    async writePeers(peers: PeerRecruitmentRecord[]): Promise<void> {
      await ensureTables(config);
      const pool = getPool(config);

      await withTransaction(pool, async (client) => {
        await client.query(`DELETE FROM ${schema}.${peersTable}`);
        for (const peer of peers) {
          await client.query(
            `
            INSERT INTO ${schema}.${peersTable} (peer_id, payload, updated_at)
            VALUES ($1, $2::jsonb, NOW())
          `,
            [peer.id, JSON.stringify(peer)]
          );
        }
      });
    },

    async appendAuditEvent(event: PeerLifecycleAuditEvent): Promise<void> {
      await ensureTables(config);
      const pool = getPool(config);
      await pool.query(
        `
        INSERT INTO ${schema}.${auditTable} (event_id, payload, created_at)
        VALUES ($1, $2::jsonb, NOW())
      `,
        [event.eventId, JSON.stringify(event)]
      );
    },

    async readAuditEvents(): Promise<PeerLifecycleAuditEvent[]> {
      await ensureTables(config);
      const pool = getPool(config);
      const result = await pool.query<{ payload: PeerLifecycleAuditEvent }>(
        `SELECT payload FROM ${schema}.${auditTable} ORDER BY created_at ASC, event_id ASC`
      );
      return result.rows.map((row) => row.payload);
    },

    async readIncidentCases(): Promise<PeerIncidentCase[]> {
      await ensureTables(config);
      const pool = getPool(config);
      const result = await pool.query<{ payload: PeerIncidentCase }>(
        `SELECT payload FROM ${schema}.${incidentsTable} ORDER BY case_id ASC`
      );
      return result.rows.map((row) => row.payload);
    },

    async writeIncidentCases(cases: PeerIncidentCase[]): Promise<void> {
      await ensureTables(config);
      const pool = getPool(config);

      await withTransaction(pool, async (client) => {
        await client.query(`DELETE FROM ${schema}.${incidentsTable}`);
        for (const item of cases) {
          await client.query(
            `
            INSERT INTO ${schema}.${incidentsTable} (case_id, payload, updated_at)
            VALUES ($1, $2::jsonb, NOW())
          `,
            [item.caseId, JSON.stringify(item)]
          );
        }
      });
    },
  };
}

export function __resetPostgresPersistenceForTests(): void {
  if (poolInstance) {
    void poolInstance.end();
  }
  poolInstance = null;
  ensurePromise = null;
}
