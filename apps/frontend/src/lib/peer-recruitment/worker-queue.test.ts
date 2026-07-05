/** @jest-environment node */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

describe('recruitment worker queue', () => {
  const originalDriver = process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;
  const originalQueuePath = process.env.PEER_RECRUITMENT_WORKER_QUEUE_PATH;
  let tempDir = '';

  beforeEach(async () => {
    jest.resetModules();
    process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = 'memory';
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aether-worker-queue-'));
    process.env.PEER_RECRUITMENT_WORKER_QUEUE_PATH = path.join(tempDir, 'queue.json');
  });

  afterEach(async () => {
    if (originalDriver === undefined) {
      delete process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;
    } else {
      process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = originalDriver;
    }

    if (originalQueuePath === undefined) {
      delete process.env.PEER_RECRUITMENT_WORKER_QUEUE_PATH;
    } else {
      process.env.PEER_RECRUITMENT_WORKER_QUEUE_PATH = originalQueuePath;
    }

    const persistence = await import('./persistence');
    persistence.__resetPeerRecruitmentPersistenceForTests();

    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('enqueues and processes forecast jobs', async () => {
    const queue = await import('./worker-queue');

    const job = await queue.enqueueRecruitmentWorkerJob({ type: 'refresh_forecast' });
    expect(job.status).toBe('queued');

    const before = await queue.listRecruitmentWorkerJobs({ status: 'queued' });
    expect(before.length).toBe(1);

    const result = await queue.processRecruitmentWorkerQueue(5);
    expect(result.processed).toBe(1);
    expect(result.completed).toBe(1);

    const completed = await queue.listRecruitmentWorkerJobs({ status: 'completed' });
    expect(completed.length).toBe(1);
    expect(completed[0].resultSummary).toContain('forecast gap');
  });
});
