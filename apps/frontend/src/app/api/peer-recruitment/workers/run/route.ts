import { NextRequest, NextResponse } from 'next/server';
import { processRecruitmentWorkerQueue } from '../../../../../lib/peer-recruitment/worker-queue';

function isAuthorized(request: NextRequest): boolean {
  const configuredKey = process.env.PEER_RECRUITMENT_WORKER_API_KEY?.trim();
  if (!configuredKey) {
    return true;
  }

  const headerKey = request.headers.get('x-worker-key')?.trim();
  if (headerKey && headerKey === configuredKey) {
    return true;
  }

  const authHeader = request.headers.get('authorization')?.trim();
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    return bearerToken === configuredKey;
  }

  return false;
}

async function runQueue(limit: number) {
  const result = await processRecruitmentWorkerQueue(limit);
  return NextResponse.json({ ok: true, ...result }, { status: 200 });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'forbidden',
        message: 'Invalid worker key.',
      },
      { status: 403 }
    );
  }

  try {
    const rawLimit = Number(request.nextUrl.searchParams.get('limit') ?? '10');
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 10;
    return await runQueue(limit);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown worker run error.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'forbidden',
        message: 'Invalid worker key.',
      },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: number };
    const rawLimit = Number(body.limit ?? 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 10;
    return await runQueue(limit);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown worker run error.',
      },
      { status: 500 }
    );
  }
}
