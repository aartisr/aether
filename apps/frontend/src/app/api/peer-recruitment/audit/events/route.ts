import { NextRequest, NextResponse } from 'next/server';
import { listRecruitmentAuditEvents } from '../../../../../lib/peer-recruitment/store';
import type { PeerLifecycleAuditEvent } from '../../../../../lib/peer-recruitment/types';

const eventTypes: PeerLifecycleAuditEvent['eventType'][] = [
  'peer.created',
  'peer.updated',
  'peer.deleted',
  'peer.activated',
  'peer.paused',
  'peer.suspended',
  'peer.unsuspended',
  'peer.screening.updated',
  'peer.training.updated',
  'peer.verification.updated',
  'incident.opened',
  'incident.resolved',
];

export async function GET(request: NextRequest) {
  try {
    const eventTypeParam = request.nextUrl.searchParams.get('eventType');
    const peerId = request.nextUrl.searchParams.get('peerId') ?? undefined;
    const actorId = request.nextUrl.searchParams.get('actorId') ?? undefined;
    const eventType = eventTypeParam && eventTypes.includes(eventTypeParam as PeerLifecycleAuditEvent['eventType'])
      ? (eventTypeParam as PeerLifecycleAuditEvent['eventType'])
      : undefined;

    const events = await listRecruitmentAuditEvents({ eventType, peerId, actorId });
    return NextResponse.json({ ok: true, count: events.length, events }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown audit read error.',
      },
      { status: 500 }
    );
  }
}
