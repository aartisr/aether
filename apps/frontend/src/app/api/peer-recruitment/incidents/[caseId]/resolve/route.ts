import { NextRequest, NextResponse } from 'next/server';
import { resolvePeerIncidentCase } from '../../../../../../lib/peer-recruitment/store';

export async function POST(request: NextRequest, context: { params: { caseId: string } }) {
  const caseId = context.params.caseId;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      resolutionNote?: string;
      actorId?: string;
      restoreToPaused?: boolean;
    };

    if (!body.resolutionNote?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'validation_error',
          message: 'resolutionNote is required.',
        },
        { status: 400 }
      );
    }

    const incident = await resolvePeerIncidentCase({
      caseId,
      resolutionNote: body.resolutionNote.trim(),
      actorId: body.actorId ?? 'api',
      restoreToPaused: body.restoreToPaused,
    });

    return NextResponse.json({ ok: true, incident }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown incident resolve error.',
      },
      { status: 500 }
    );
  }
}
