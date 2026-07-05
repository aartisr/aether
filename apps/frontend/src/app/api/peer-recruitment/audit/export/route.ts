import { NextRequest, NextResponse } from 'next/server';
import { listRecruitmentAuditEvents } from '../../../../../lib/peer-recruitment/store';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const eventType = request.nextUrl.searchParams.get('eventType') ?? undefined;
    const peerId = request.nextUrl.searchParams.get('peerId') ?? undefined;
    const actorId = request.nextUrl.searchParams.get('actorId') ?? undefined;
    const events = await listRecruitmentAuditEvents({ eventType: eventType as never, peerId, actorId });

    const header = [
      'eventId',
      'eventType',
      'peerId',
      'previousState',
      'nextState',
      'reason',
      'actorType',
      'actorId',
      'timestamp',
    ];

    const rows = events.map((event) =>
      [
        event.eventId,
        event.eventType,
        event.peerId,
        event.previousState,
        event.nextState,
        event.reason ?? '',
        event.actorType,
        event.actorId,
        event.timestamp,
      ]
        .map((value) => csvEscape(String(value)))
        .join(',')
    );

    const csv = `${header.join(',')}\n${rows.join('\n')}\n`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="peer-recruitment-audit.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown audit export error.',
      },
      { status: 500 }
    );
  }
}
