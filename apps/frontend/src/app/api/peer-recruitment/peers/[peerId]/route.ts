import { NextResponse } from 'next/server';
import { PeerRecordValidationError, parseUpdatePeerInputFromBody } from '../../../../../lib/peer-recruitment/peer-records';
import {
  deleteRecruitmentPeer,
  getRecruitmentPeer,
  updateRecruitmentPeer,
} from '../../../../../lib/peer-recruitment/store';

export async function GET(_request: Request, context: { params: { peerId: string } }) {
  try {
    const peerId = context.params.peerId;
    const peer = await getRecruitmentPeer(peerId);

    if (!peer) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'not_found',
          message: `Peer ${peerId} not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, peer }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: { params: { peerId: string } }) {
  try {
    const peerId = context.params.peerId;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch = parseUpdatePeerInputFromBody(body);
    const peer = await updateRecruitmentPeer(peerId, patch, 'api', 'peer updated via API');

    return NextResponse.json({ ok: true, peer }, { status: 200 });
  } catch (error) {
    if (error instanceof PeerRecordValidationError) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'validation_error',
          message: error.message,
        },
        { status: 400 }
      );
    }

    if ((error as Error).message.includes('not found')) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'not_found',
          message: (error as Error).message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: { peerId: string } }) {
  try {
    const peerId = context.params.peerId;
    await deleteRecruitmentPeer(peerId, 'api', 'peer deleted via API');

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'not_found',
          message: (error as Error).message,
        },
        { status: 404 }
      );
    }

    if ((error as Error).message.includes('open incidents')) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'conflict',
          message: (error as Error).message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
