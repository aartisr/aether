import fs from 'node:fs/promises';
import path from 'node:path';
import { getRecruitmentForecast } from './forecasting';
import { getRecruitmentFairnessSnapshot } from './fairness';
import { listPeerIncidentCases } from './store';

export type RecruitmentWorkerJobType = 'refresh_forecast' | 'refresh_fairness' | 'incident_sla_check';
export type RecruitmentWorkerJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export type RecruitmentWorkerJob = {
  id: string;
  type: RecruitmentWorkerJobType;
  status: RecruitmentWorkerJobStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  payload?: Record<string, string | number | boolean | null>;
  resultSummary?: string;
  errorMessage?: string;
};

type QueueStore = {
  jobs: RecruitmentWorkerJob[];
};

const MAX_ATTEMPTS = 3;

function getQueueStorePath(): string {
  return path.resolve(
    process.env.PEER_RECRUITMENT_WORKER_QUEUE_PATH ??
      path.join(process.cwd(), '.data', 'peer-recruitment-worker-queue.json')
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(): string {
  return `job-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

async function readQueueStore(): Promise<QueueStore> {
  const storePath = getQueueStorePath();

  try {
    const raw = await fs.readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw) as QueueStore;

    if (!parsed || !Array.isArray(parsed.jobs)) {
      return { jobs: [] };
    }

    return { jobs: parsed.jobs };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { jobs: [] };
    }

    throw error;
  }
}

async function writeQueueStore(store: QueueStore): Promise<void> {
  const storePath = getQueueStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

function summarizeSla(incidents: Awaited<ReturnType<typeof listPeerIncidentCases>>, thresholdHours: number): string {
  const now = Date.now();
  const breached = incidents.filter((incident) => {
    const openedAt = new Date(incident.openedAt).getTime();
    return Number.isFinite(openedAt) && now - openedAt > thresholdHours * 60 * 60 * 1000;
  }).length;

  return `open=${incidents.length}, breached=${breached}, thresholdHours=${thresholdHours}`;
}

async function executeJob(job: RecruitmentWorkerJob): Promise<string> {
  switch (job.type) {
    case 'refresh_forecast': {
      const result = await getRecruitmentForecast();
      return `forecast gap shortfall=${result.gap.projectedShortfall}, surplus=${result.gap.projectedSurplus}`;
    }
    case 'refresh_fairness': {
      const result = await getRecruitmentFairnessSnapshot();
      return `fairness cohorts=${result.metrics.length}, events=${result.auditLog.length}`;
    }
    case 'incident_sla_check': {
      const thresholdHours = Number(process.env.PEER_RECRUITMENT_INCIDENT_SLA_HOURS ?? 24);
      const openIncidents = await listPeerIncidentCases({ status: 'open' });
      return summarizeSla(openIncidents, thresholdHours);
    }
    default:
      return 'unknown_job_type';
  }
}

export async function enqueueRecruitmentWorkerJob(input: {
  type: RecruitmentWorkerJobType;
  payload?: Record<string, string | number | boolean | null>;
}): Promise<RecruitmentWorkerJob> {
  const store = await readQueueStore();
  const now = nowIso();

  const job: RecruitmentWorkerJob = {
    id: randomId(),
    type: input.type,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    payload: input.payload,
  };

  store.jobs.push(job);
  await writeQueueStore(store);
  return job;
}

export async function listRecruitmentWorkerJobs(filters?: {
  status?: RecruitmentWorkerJobStatus;
  type?: RecruitmentWorkerJobType;
  limit?: number;
}): Promise<RecruitmentWorkerJob[]> {
  const store = await readQueueStore();
  let jobs = store.jobs.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters?.status) {
    jobs = jobs.filter((job) => job.status === filters.status);
  }

  if (filters?.type) {
    jobs = jobs.filter((job) => job.type === filters.type);
  }

  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 100;
  return jobs.slice(0, limit);
}

export async function processRecruitmentWorkerQueue(limit = 10): Promise<{
  processed: number;
  completed: number;
  failed: number;
}> {
  const store = await readQueueStore();
  const queued = store.jobs.filter((job) => job.status === 'queued').slice(0, Math.max(1, limit));

  let completed = 0;
  let failed = 0;

  for (const queuedJob of queued) {
    const index = store.jobs.findIndex((job) => job.id === queuedJob.id);
    if (index < 0) {
      continue;
    }

    store.jobs[index] = {
      ...store.jobs[index],
      status: 'running',
      updatedAt: nowIso(),
      attempts: store.jobs[index].attempts + 1,
      errorMessage: undefined,
    };
    await writeQueueStore(store);

    try {
      const resultSummary = await executeJob(store.jobs[index]);
      store.jobs[index] = {
        ...store.jobs[index],
        status: 'completed',
        updatedAt: nowIso(),
        resultSummary,
      };
      completed += 1;
    } catch (error) {
      const attempts = store.jobs[index].attempts;
      const exhausted = attempts >= MAX_ATTEMPTS;
      store.jobs[index] = {
        ...store.jobs[index],
        status: exhausted ? 'failed' : 'queued',
        updatedAt: nowIso(),
        errorMessage: error instanceof Error ? error.message : 'Unknown worker error.',
      };

      if (exhausted) {
        failed += 1;
      }
    }

    await writeQueueStore(store);
  }

  return {
    processed: queued.length,
    completed,
    failed,
  };
}
