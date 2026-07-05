import { NextRequest, NextResponse } from 'next/server';
import { PeerLifecycleTransitionError } from '../../../../../../lib/peer-recruitment/lifecycle';
import { pauseRecruitmentPeer } from '../../../../../../lib/peer-recruitment/store';

export async function POST(request: NextRequest, context: { params: { peerId: string } }) {
  const peerId = context.params.peerId;

  try {
    const body = (await request.json().catch(() => ({}))) as { actorId?: string; reason?: string };
    const peer = await pauseRecruitmentPeer(peerId, body.actorId ?? 'api', body.reason);

    return NextResponse.json({ ok: true, peer }, { status: 200 });
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: error.code,
          message: error.message,
        },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown pause error.';

    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message,
      },
      { status: 500 }
    );
  }
}
