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

  it('uses negation and contrast to avoid false negatives', async () => {
    await expect(
      analyzeLocalEchoTranscript("I was anxious earlier, but I'm not hopeless anymore. I feel calmer and supported now."),
    ).resolves.toMatchObject({
      sentiment: { label: 'Positive' },
      safety: { label: 'low' },
    });
  });

  it('raises intensity for amplified distress language', async () => {
    const result = await analyzeLocalEchoTranscript('I feel VERY overwhelmed and incredibly trapped!!!');

    expect(result.sentiment.label).toBe('Negative');
    expect(result.sentiment.score).toBeGreaterThan(0.55);
  });

  it('credits protective context when distress is present', async () => {
    await expect(
      analyzeLocalEchoTranscript("I had a panic attack, but I'm safe with my roommate and texted my counselor."),
    ).resolves.toMatchObject({
      safety: { label: 'low' },
    });
  });

  it('does not treat negated self-harm denial as active high risk', async () => {
    await expect(
      analyzeLocalEchoTranscript("I'm not suicidal and I don't want to hurt myself. I just need sleep."),
    ).resolves.toMatchObject({
      safety: { label: 'low' },
    });
  });

  it('prioritizes explicit crisis language over protective context', async () => {
    await expect(
      analyzeLocalEchoTranscript("I'm with a friend right now, but I want to kill myself tonight."),
    ).resolves.toMatchObject({
      safety: { label: 'high' },
      escalation: { urgency: 'immediate' },
    });
  });
});