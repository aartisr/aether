import { scoreCheckIn } from './checkin';
import { checkInQuestions, researchReferences } from './resilience-model';

describe('scoreCheckIn', () => {
  it('returns low risk for empty answers', () => {
    const result = scoreCheckIn({});

    expect(result.riskLevel).toBe('low');
    expect(result.total).toBe(0);
  });

  it('returns critical risk for sustained high distress', () => {
    const answers = Object.fromEntries(checkInQuestions.map((question) => [question.id, 4]));

    const result = scoreCheckIn(answers);

    expect(result.riskLevel).toBe('critical');
    expect(result.percent).toBeGreaterThanOrEqual(75);
  });

  it('applies support protective effect', () => {
    const baseAnswers = Object.fromEntries(checkInQuestions.map((question) => [question.id, 3]));
    const withoutSupport = scoreCheckIn({ ...baseAnswers, support: 0 });
    const withSupport = scoreCheckIn({ ...baseAnswers, support: 4 });

    expect(withSupport.total).toBeLessThan(withoutSupport.total);
  });
});

describe('researchReferences', () => {
  it('keeps at least 20 benchmark sources', () => {
    expect(researchReferences.length).toBeGreaterThanOrEqual(20);
  });
});
