import { NextResponse } from 'next/server';
import { PeerRecordValidationError, parseCreatePeerInputFromBody } from '../../../../lib/peer-recruitment/peer-records';
import { createRecruitmentPeer, listRecruitmentPeers } from '../../../../lib/peer-recruitment/store';

export async function GET() {
  try {
    const peers = await listRecruitmentPeers();

    return NextResponse.json(
      {
        ok: true,
        count: peers.length,
        peers,
      },
      { status: 200 }
    );
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

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const input = parseCreatePeerInputFromBody(body);
    const peer = await createRecruitmentPeer(input, 'api', 'peer created via API');

    return NextResponse.json(
      {
        ok: true,
        peer,
      },
      { status: 201 }
    );
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
