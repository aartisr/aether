import { NextRequest, NextResponse } from 'next/server';
import { PeerLifecycleTransitionError } from '../../../../../../lib/peer-recruitment/lifecycle';
import { updatePeerTrainingStatus } from '../../../../../../lib/peer-recruitment/store';
import type { TrainingStatus } from '../../../../../../lib/peer-recruitment/types';

const allowed: TrainingStatus[] = ['not_started', 'in_progress', 'complete', 'expired'];

export async function POST(request: NextRequest, context: { params: { peerId: string } }) {
  const peerId = context.params.peerId;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      status?: TrainingStatus;
      actorId?: string;
      reason?: string;
    };

    if (!body.status || !allowed.includes(body.status)) {
      return NextResponse.json(
        { ok: false, errorCode: 'validation_error', message: 'Invalid training status.' },
        { status: 400 }
      );
    }

    const peer = await updatePeerTrainingStatus(peerId, body.status, body.actorId ?? 'api', body.reason);
    return NextResponse.json({ ok: true, peer }, { status: 200 });
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      return NextResponse.json(
        { ok: false, errorCode: error.code, message: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown training error.',
      },
      { status: 500 }
    );
  }
}
