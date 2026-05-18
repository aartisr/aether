import { NextResponse } from 'next/server';
import { saveFeedbackSubmission, validateFeedbackSubmission } from '../../../lib/feedback/store';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validation = validateFeedbackSubmission(body);
  if (!validation.ok) {
    return NextResponse.json({ error: 'Feedback validation failed.', details: validation.errors }, { status: 400 });
  }

  const record = await saveFeedbackSubmission(validation.value);

  return NextResponse.json(
    {
      id: record.id,
      status: record.status,
      createdAt: record.createdAt,
      reviewPath: '/admin/feedback',
    },
    {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
