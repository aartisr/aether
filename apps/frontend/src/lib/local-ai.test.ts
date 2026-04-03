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

  it('classifies calm supported language as positive rather than flat neutral', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel calm, supported, and more grounded now.'),
    ).resolves.toMatchObject({
      sentiment: { label: 'Positive' },
      safety: { label: 'low' },
    });
  });

  it('classifies depleted language as negative even without crisis phrases', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel exhausted, flat, and heavy today.'),
    ).resolves.toMatchObject({
      sentiment: { label: 'Negative' },
      safety: { label: 'low' },
    });
  });

  it('recognizes activated positive language as positive', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel ready, motivated, and focused to handle this.'),
    ).resolves.toMatchObject({
      sentiment: { label: 'Positive' },
      safety: { label: 'low' },
    });
  });

  it('returns grounded recommendations for calm supported language', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel calm, supported, and steady today.'),
    ).resolves.toMatchObject({
      recommendations: expect.arrayContaining(['Protect the habits or people that are helping you stay steady.']),
    });
  });

  it('returns energized recommendations for activated positive language', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel ready, motivated, and energized to move forward.'),
    ).resolves.toMatchObject({
      recommendations: expect.arrayContaining(['Turn this momentum into one concrete next step before it diffuses.']),
    });
  });

  it('returns drained recommendations for depleted low-energy language', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel exhausted, flat, and heavy today.'),
    ).resolves.toMatchObject({
      recommendations: expect.arrayContaining(['Reduce load before asking yourself for more output.']),
    });
  });

  it('returns overwhelmed recommendations for activated distress language', async () => {
    await expect(
      analyzeLocalEchoTranscript('I feel overwhelmed, on edge, and like everything is urgent.'),
    ).resolves.toMatchObject({
      recommendations: expect.arrayContaining(['Start a same-day handoff to campus counseling or another trained support channel.']),
      escalation: { urgency: 'same-day' },
    });
  });
});