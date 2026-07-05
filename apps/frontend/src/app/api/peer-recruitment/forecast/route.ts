import { NextRequest, NextResponse } from 'next/server';
import { getRecruitmentForecast } from '../../../../lib/peer-recruitment/forecasting';

function asBoundedNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const horizonDaysRaw = asBoundedNumber(request.nextUrl.searchParams.get('horizonDays'), 14);
    const horizonDays = (horizonDaysRaw === 7 || horizonDaysRaw === 30 ? horizonDaysRaw : 14) as 7 | 14 | 30;

    const forecast = await getRecruitmentForecast({
      horizonDays,
      dailyIncomingMatchDemand: asBoundedNumber(request.nextUrl.searchParams.get('dailyDemand'), 5),
      maxNewPeerBudget: asBoundedNumber(request.nextUrl.searchParams.get('maxNewPeers'), 12),
      maxTrainingCompletions: asBoundedNumber(request.nextUrl.searchParams.get('maxTraining'), 10),
      maxVerifications: asBoundedNumber(request.nextUrl.searchParams.get('maxVerifications'), 10),
    });

    return NextResponse.json({ ok: true, forecast }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'dependency_failure',
        message: error instanceof Error ? error.message : 'Unknown forecast error.',
      },
      { status: 500 }
    );
  }
}
