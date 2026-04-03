import { analyzeLocalEchoTranscript, KeywordRuleClassifier } from './local-ai';

describe('local-ai', () => {
  it('classifies transcripts with a generic keyword classifier', () => {
    const classifier = new KeywordRuleClassifier<'alpha' | 'beta'>(
      {
        alpha: ['steady', 'clear'],
        beta: ['stuck', 'overwhelmed'],
      },
      'alpha',
    );

    expect(classifier.classify('I feel overwhelmed and stuck today')).toEqual({
      label: 'beta',
      score: expect.any(Number),
      matchedTerms: ['stuck', 'overwhelmed'],
    });
  });

  it('returns low-risk neutral analysis for empty input', async () => {
    await expect(analyzeLocalEchoTranscript('')).resolves.toMatchObject({
      transcript: '',
      sentiment: { label: 'Neutral' },
      safety: { label: 'low' },
    });
  });

  it('detects negative sentiment and elevated safety risk', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel overwhelmed, hopeless, and like I cannot cope.'),
    ).resolves.toMatchObject({
      sentiment: { label: 'Negative' },
      safety: { label: 'medium' },
    });
  });

  it('detects high-risk phrasing', async () => {
    await expect(
      analyzeLocalEchoTranscript('I want to disappear and hurt myself.'),
    ).resolves.toMatchObject({
      safety: { label: 'high' },
    });
  });
});