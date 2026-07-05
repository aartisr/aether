import { NextRequest, NextResponse } from 'next/server';
import { listPeerIncidentCases, openPeerIncidentCase } from '../../../../lib/peer-recruitment/store';
import type { IncidentSeverity, IncidentStatus } from '../../../../lib/peer-recruitment/types';

const severities: IncidentSeverity[] = ['p0', 'p1', 'p2', 'p3'];
const statuses: IncidentStatus[] = ['open', 'resolved'];

export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get('status') ?? undefined;
    const peerId = request.nextUrl.searchParams.get('peerId') ?? undefined;
    const status = statusParam && statuses.includes(statusParam as IncidentStatus)
      ? (statusParam as IncidentStatus)
      : undefined;

    const incidents = await listPeerIncidentCases({ status, peerId });
    return NextResponse.json({ ok: true, count: incidents.length, incidents }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown incident list error.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      peerId?: string;
      severity?: IncidentSeverity;
      summary?: string;
      actorId?: string;
    };

    if (!body.peerId || !body.severity || !severities.includes(body.severity) || !body.summary?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'validation_error',
          message: 'peerId, severity, and summary are required.',
        },
        { status: 400 }
      );
    }

    const incident = await openPeerIncidentCase({
      peerId: body.peerId,
      severity: body.severity,
      summary: body.summary.trim(),
      actorId: body.actorId ?? 'api',
    });

    return NextResponse.json({ ok: true, incident }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown incident open error.',
      },
      { status: 500 }
    );
  }
}
