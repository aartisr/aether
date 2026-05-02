#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';

const port = Number(process.env.PERF_PORT ?? '4010');
const host = process.env.PERF_HOST ?? '127.0.0.1';
const baseUrl = `http://${host}:${port}`;

const routeList = (process.env.PERF_ROUTES ?? '/,/blog,/sitemap.xml,/llms.txt,/feed.xml,/image-sitemap.xml,/robots.txt')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

const samples = Number(process.env.PERF_SAMPLES ?? '5');
const warmups = Number(process.env.PERF_WARMUPS ?? '2');
const timeoutMs = Number(process.env.PERF_TIMEOUT_MS ?? '4000');
const startupTimeoutMs = Number(process.env.PERF_STARTUP_TIMEOUT_MS ?? '45000');
const p95BudgetMs = Number(process.env.PERF_BUDGET_P95_MS ?? '900');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTiming(url) {
  const started = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
    });

    const elapsedMs = performance.now() - started;
    return {
      ok: response.ok,
      status: response.status,
      elapsedMs,
    };
  } catch (error) {
    const elapsedMs = performance.now() - started;
    return {
      ok: false,
      status: 0,
      elapsedMs,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(rank, sorted.length - 1))];
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

async function waitForServerReady() {
  const deadline = Date.now() + startupTimeoutMs;
  while (Date.now() < deadline) {
    const probe = await fetchWithTiming(`${baseUrl}/api/health`);
    if (probe.ok) {
      return;
    }
    await sleep(500);
  }

  throw new Error(`Server did not become ready within ${startupTimeoutMs}ms`);
}

function printSummary(results) {
  console.log('');
  console.log(`Performance budget report (p95 <= ${p95BudgetMs} ms)`);
  console.log('Route                              avg(ms)  p95(ms)  status');
  console.log('----------------------------------------------------------------');

  for (const result of results) {
    const routeCell = result.route.padEnd(34);
    const avgCell = result.avg.toFixed(1).padStart(7);
    const p95Cell = result.p95.toFixed(1).padStart(7);
    const statusCell = result.pass ? 'PASS' : 'FAIL';
    console.log(`${routeCell} ${avgCell}  ${p95Cell}  ${statusCell}`);
  }

  console.log('----------------------------------------------------------------');
}

async function run() {
  const nextProcess = spawn('npm', ['run', 'start', '--', '-p', String(port), '-H', host], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  let startupLogs = '';

  nextProcess.stdout.on('data', (chunk) => {
    startupLogs += chunk.toString();
  });

  nextProcess.stderr.on('data', (chunk) => {
    startupLogs += chunk.toString();
  });

  const shutdown = () => {
    if (!nextProcess.killed) {
      nextProcess.kill('SIGTERM');
    }
  };

  process.on('exit', shutdown);
  process.on('SIGINT', () => {
    shutdown();
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    shutdown();
    process.exit(1);
  });

  try {
    await waitForServerReady();

    const results = [];

    for (const route of routeList) {
      const url = `${baseUrl}${route}`;

      for (let i = 0; i < warmups; i += 1) {
        await fetchWithTiming(url);
      }

      const timings = [];
      let statusFailed = false;

      for (let i = 0; i < samples; i += 1) {
        const attempt = await fetchWithTiming(url);
        timings.push(attempt.elapsedMs);

        if (!attempt.ok) {
          statusFailed = true;
        }
      }

      const avg = average(timings);
      const p95 = percentile(timings, 95);
      const pass = !statusFailed && p95 <= p95BudgetMs;

      results.push({ route, avg, p95, pass });
    }

    printSummary(results);

    const hasFailure = results.some((result) => !result.pass);
    if (hasFailure) {
      console.error('Performance budget failed.');
      process.exitCode = 1;
      return;
    }

    console.log('Performance budget passed.');
  } catch (error) {
    console.error('Performance smoke check failed to run.');
    console.error(error instanceof Error ? error.message : String(error));
    if (startupLogs.trim()) {
      console.error('Server logs:');
      console.error(startupLogs.trim());
    }
    process.exitCode = 1;
  } finally {
    shutdown();
    await sleep(250);
  }
}

run();
