import { checkInQuestions, type RiskLevel } from './resilience-model';

export interface CheckInResult {
  total: number;
  max: number;
  percent: number;
  riskLevel: RiskLevel;
  summary: string;
  recommendations: string[];
}

export function scoreCheckIn(answers: Record<string, number>): CheckInResult {
  const distressQuestionCount = checkInQuestions.filter((question) => question.id !== 'support').length;
  const max = distressQuestionCount * 4;

  const total = checkInQuestions.reduce((sum, question) => {
    if (question.id === 'support') {
      return sum;
    }

    const value = Number.isFinite(answers[question.id]) ? answers[question.id] : 0;
    return sum + Math.max(0, Math.min(4, value));
  }, 0);

  const supportProtective = Number.isFinite(answers.support) ? Math.max(0, Math.min(4, answers.support)) : 0;
  const adjustedTotal = Math.max(0, total - supportProtective);
  const percent = Math.round((adjustedTotal / max) * 100);

  let riskLevel: RiskLevel = 'low';
  if (percent >= 75) {
    riskLevel = 'critical';
  } else if (percent >= 55) {
    riskLevel = 'high';
  } else if (percent >= 30) {
    riskLevel = 'moderate';
  }

  const recommendations = recommendationByRisk[riskLevel];

  return {
    total: adjustedTotal,
    max,
    percent,
    riskLevel,
    summary: summaryByRisk[riskLevel],
    recommendations,
  };
}

const summaryByRisk: Record<RiskLevel, string> = {
  low: 'Your current resilience signals look stable. Keep your protective routines active.',
  moderate: 'You may be carrying sustained pressure. Light-touch support and routines can help early.',
  high: 'Your responses suggest significant strain. Consider direct support and a clear safety plan today.',
  critical: 'Your responses indicate acute risk. Reach immediate support now and do not handle this alone.',
};

const recommendationByRisk: Record<RiskLevel, string[]> = {
  low: [
    'Maintain your sleep and social routines for consistency.',
    'Use one short stress-reset exercise before high workload blocks.',
  ],
  moderate: [
    'Complete a safety and support plan with one trusted contact.',
    'Use the resource navigator to match support to your top concern.',
    'Start a 7-day habit plan to stabilize sleep and focus.',
  ],
  high: [
    'Contact a counselor, advisor, or trained support person today.',
    'Use peer support and do not isolate while under high load.',
    'If safety worsens, contact 988 immediately.',
  ],
  critical: [
    'Call or text 988 now for immediate support.',
    'Contact a trusted person and stay connected until risk reduces.',
    'If there is imminent danger, call emergency services right away.',
  ],
};
