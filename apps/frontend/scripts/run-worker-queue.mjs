#!/usr/bin/env node

const workerRunUrl = (process.env.PEER_RECRUITMENT_WORKER_RUN_URL ?? 'http://localhost:3000/api/peer-recruitment/workers/run').trim();
const apiKey = process.env.PEER_RECRUITMENT_WORKER_API_KEY?.trim();
const rawLimit = Number(process.env.PEER_RECRUITMENT_WORKER_RUN_LIMIT ?? '25');
const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 25;

async function main() {
  const headers = {
    'content-type': 'application/json',
  };

  if (apiKey) {
    headers['x-worker-key'] = apiKey;
    headers.authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(workerRunUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ limit }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.message === 'string' ? payload.message : `worker run failed with status ${response.status}`;
    throw new Error(message);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        processed: payload.processed,
        completed: payload.completed,
        failed: payload.failed,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(`[worker-runner] ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exitCode = 1;
});
