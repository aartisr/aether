import { NextRequest, NextResponse } from 'next/server';
import {
  enqueueRecruitmentWorkerJob,
  listRecruitmentWorkerJobs,
  type RecruitmentWorkerJobStatus,
  type RecruitmentWorkerJobType,
} from '../../../../../lib/peer-recruitment/worker-queue';

const jobTypes: RecruitmentWorkerJobType[] = ['refresh_forecast', 'refresh_fairness', 'incident_sla_check'];
const jobStatuses: RecruitmentWorkerJobStatus[] = ['queued', 'running', 'completed', 'failed'];

function parseType(value: string | null): RecruitmentWorkerJobType | undefined {
  if (!value) return undefined;
  return jobTypes.includes(value as RecruitmentWorkerJobType) ? (value as RecruitmentWorkerJobType) : undefined;
}

function parseStatus(value: string | null): RecruitmentWorkerJobStatus | undefined {
  if (!value) return undefined;
  return jobStatuses.includes(value as RecruitmentWorkerJobStatus) ? (value as RecruitmentWorkerJobStatus) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const status = parseStatus(request.nextUrl.searchParams.get('status'));
    const type = parseType(request.nextUrl.searchParams.get('type'));
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '100');

    const jobs = await listRecruitmentWorkerJobs({
      status,
      type,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 100,
    });

    return NextResponse.json({ ok: true, count: jobs.length, jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown worker queue read error.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      type?: RecruitmentWorkerJobType;
      payload?: Record<string, string | number | boolean | null>;
    };

    if (!body.type || !jobTypes.includes(body.type)) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'validation_error',
          message: 'Valid worker job type is required.',
        },
        { status: 400 }
      );
    }

    const job = await enqueueRecruitmentWorkerJob({ type: body.type, payload: body.payload });
    return NextResponse.json({ ok: true, job }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown worker queue enqueue error.',
      },
      { status: 500 }
    );
  }
}
