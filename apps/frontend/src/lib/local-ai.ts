export type LabelScore<TLabel extends string> = {
  label: TLabel;
  score: number;
  matchedTerms: string[];
};

export type TranscriptSource = 'speech-recognition' | 'manual' | 'unavailable';

export type VoiceCapture = {
  audio: Blob;
  transcript: string;
  transcriptSource: TranscriptSource;
};

export type SentimentLabel = 'Positive' | 'Neutral' | 'Negative';
export type SafetyLevel = 'low' | 'medium' | 'high';

export type LocalEchoAnalysis = {
  transcript: string;
  sentiment: LabelScore<SentimentLabel>;
  safety: LabelScore<SafetyLevel>;
  recommendations: string[];
  escalation: {
    urgency: 'routine' | 'same-day' | 'immediate';
    rationale: string[];
    resources: Array<{
      id: string;
      title: string;
      availability: string;
      actionLabel: string;
      actionHref: string;
    }>;
  };
  analysisEngine: string;
};

type RuleSet<TLabel extends string> = Record<TLabel, string[]>;

const positiveTerms = [
  'calm',
  'confident',
  'good',
  'grateful',
  'grounded',
  'hopeful',
  'okay',
  'optimistic',
  'proud',
  'relieved',
  'safe',
  'stable',
  'supported',
];

const negativeTerms = [
  'alone',
  'anxious',
  'ashamed',
  'burned out',
  'drained',
  'hopeless',
  'numb',
  'overwhelmed',
  'panic',
  'scared',
  'stressed',
  'trapped',
  'upset',
  'worried',
  'worthless',
];

const safetyRules: RuleSet<SafetyLevel> = {
  low: ['tired', 'stressed', 'upset', 'worried'],
  medium: ['can\'t cope', 'isolated', 'panic', 'shut down', 'spiraling', 'unsafe', 'no one to talk to'],
  high: [
    'end it',
    'hurt myself',
    'kill myself',
    'not worth living',
    'self harm',
    'suicide',
    'want to disappear',
    'can\'t go on',
    'no reason to live',
    'better off dead',
  ],
};

const sentimentRules: RuleSet<SentimentLabel> = {
  Positive: positiveTerms,
  Neutral: ['fine', 'neutral', 'normal', 'so-so'],
  Negative: negativeTerms,
};

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function collectMatches(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term));
}

function toRangeScore(matchCount: number, denominator: number) {
  if (matchCount <= 0) return 0;
  return Math.min(1, matchCount / denominator);
}

type RuntimeProvider = {
  id: string;
  classifySentiment(input: string): Promise<LabelScore<SentimentLabel>>;
  classifySafety(input: string): Promise<LabelScore<SafetyLevel>>;
};

type ZeroShotResult = {
  labels?: unknown;
  scores?: unknown;
};

type ZeroShotPipeline = (input: string, labels: string[]) => Promise<ZeroShotResult>;

type TransformersModule = {
  pipeline?: (task: string, model: string) => Promise<ZeroShotPipeline>;
};

function isTransformersModule(value: unknown): value is TransformersModule {
  return typeof value === 'object' && value !== null && 'pipeline' in value;
}

let runtimeProviderPromise: Promise<RuntimeProvider | null> | null = null;

async function tryCreateTransformersRuntimeProvider(): Promise<RuntimeProvider | null> {
  const dynamicImport = new Function('moduleName', 'return import(moduleName)') as (
    moduleName: string,
  ) => Promise<unknown>;

  try {
    const importedModule = await dynamicImport('@xenova/transformers');
    if (!isTransformersModule(importedModule)) {
      return null;
    }

    const createPipeline = importedModule.pipeline;

    if (!createPipeline) {
      return null;
    }

    const zeroShot = await createPipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');

    return {
      id: 'transformers-zero-shot',
      async classifySentiment(input: string) {
        const labels: SentimentLabel[] = ['Positive', 'Neutral', 'Negative'];
        const result = await zeroShot(input, labels);
        const predictedLabels = Array.isArray(result?.labels) ? result.labels : [];
        const scores = Array.isArray(result?.scores) ? result.scores : [];
        const topLabel = (predictedLabels[0] as SentimentLabel | undefined) || 'Neutral';
        const topScore = typeof scores[0] === 'number' ? scores[0] : 0;

        return {
          label: topLabel,
          score: topScore,
          matchedTerms: [],
        };
      },
      async classifySafety(input: string) {
        const labels: SafetyLevel[] = ['high', 'medium', 'low'];
        const result = await zeroShot(input, labels);
        const predictedLabels = Array.isArray(result?.labels) ? result.labels : [];
        const scores = Array.isArray(result?.scores) ? result.scores : [];
        const topLabel = (predictedLabels[0] as SafetyLevel | undefined) || 'low';
        const topScore = typeof scores[0] === 'number' ? scores[0] : 0;

        return {
          label: topLabel,
          score: topScore,
          matchedTerms: [],
        };
      },
    };
  } catch {
    return null;
  }
}

async function getRuntimeProvider() {
  if (!runtimeProviderPromise) {
    runtimeProviderPromise = tryCreateTransformersRuntimeProvider();
  }
  return runtimeProviderPromise;
}

export class KeywordRuleClassifier<TLabel extends string> {
  constructor(
    private readonly rules: RuleSet<TLabel>,
    private readonly defaultLabel: TLabel,
  ) {}

  classify(input: string): LabelScore<TLabel> {
    const normalized = normalize(input);
    let bestLabel = this.defaultLabel;
    let bestMatches: string[] = [];

    for (const [label, terms] of Object.entries(this.rules) as Array<[TLabel, string[]]>) {
      const matches = collectMatches(normalized, terms);
      if (matches.length > bestMatches.length) {
        bestLabel = label;
        bestMatches = matches;
      }
    }

    const score = bestMatches.length === 0 ? 0 : Math.min(1, bestMatches.length / 3);
    return {
      label: bestLabel,
      score,
      matchedTerms: bestMatches,
    };
  }
}

const sentimentClassifier = new KeywordRuleClassifier<SentimentLabel>(sentimentRules, 'Neutral');
const safetyClassifier = new KeywordRuleClassifier<SafetyLevel>(safetyRules, 'low');

const resourceCatalog = {
  crisis: {
    id: 'crisis-988',
    title: 'Urgent Crisis Support (988)',
    availability: '24/7',
    actionLabel: 'Call or Text 988',
    actionHref: 'https://988lifeline.org/',
  },
  campus: {
    id: 'campus-counseling',
    title: 'Campus Counseling Linkout',
    availability: 'Campus hours',
    actionLabel: 'Build Referral Notes',
    actionHref: '#safety-plan',
  },
  peer: {
    id: 'peer-circle',
    title: 'Peer Support Circle',
    availability: 'Daily sessions',
    actionLabel: 'Open Peer Navigator',
    actionHref: '/peer-navigator',
  },
  navigation: {
    id: 'care-navigation',
    title: 'Care Navigation Checklist',
    availability: 'On-demand',
    actionLabel: 'Open Safety Plan',
    actionHref: '#safety-plan',
  },
};

function deriveEscalation(safety: LabelScore<SafetyLevel>, sentiment: LabelScore<SentimentLabel>, transcript: string) {
  const normalized = normalize(transcript);
  const rationale: string[] = [];

  const immediateContext = /(right now|tonight|plan|means|alone)/.test(normalized);
  const sustainedDistress = /(every day|all day|for weeks|for months|constantly)/.test(normalized);

  if (safety.label === 'high' || (safety.label === 'medium' && immediateContext)) {
    rationale.push('High-risk or immediate-timeframe language detected.');
    if (immediateContext) {
      rationale.push('Urgency context indicates support should happen immediately.');
    }
    return {
      urgency: 'immediate' as const,
      rationale,
      resources: [resourceCatalog.crisis, resourceCatalog.campus, resourceCatalog.navigation],
    };
  }

  if (safety.label === 'medium' || (sentiment.label === 'Negative' && sustainedDistress)) {
    rationale.push('Elevated distress or sustained pressure detected.');
    if (sustainedDistress) {
      rationale.push('Pattern suggests same-day support handoff is safer than waiting.');
    }
    return {
      urgency: 'same-day' as const,
      rationale,
      resources: [resourceCatalog.campus, resourceCatalog.peer, resourceCatalog.navigation],
    };
  }

  rationale.push('No urgent risk markers detected in this transcript.');
  return {
    urgency: 'routine' as const,
    rationale,
    resources: [resourceCatalog.peer],
  };
}

function buildRecommendations(sentiment: SentimentLabel, safety: SafetyLevel, urgency: 'routine' | 'same-day' | 'immediate') {
  if (urgency === 'immediate') {
    return [
      'Contact immediate crisis support first, then notify a trusted person.',
      'Keep this tab open and follow the crisis and campus actions below.',
      'If you are in immediate danger, call local emergency services now.',
    ];
  }

  if (urgency === 'same-day') {
    return [
      'Start a same-day handoff to campus counseling or another trained support channel.',
      'Use peer support now while scheduling professional follow-up today.',
      'Write one sentence describing your current risk so support can respond faster.',
    ];
  }

  if (safety === 'high') {
    return [
      'Reach out to a trusted person or crisis contact right now.',
      'Move to a safer environment and avoid being alone if possible.',
      'Use the support resources on this site for immediate next steps.',
    ];
  }

  if (safety === 'medium') {
    return [
      'Pause and ground yourself with one small physical reset.',
      'Message one trusted person before this feeling compounds.',
      'Pick one support option from the resilience pathway today.',
    ];
  }

  if (sentiment === 'Negative') {
    return [
      'Name the main stressor in one sentence.',
      'Choose one supportive action you can finish in 10 minutes.',
      'Check back in after a short reset to see if the intensity changed.',
    ];
  }

  if (sentiment === 'Positive') {
    return [
      'Notice what helped you feel more steady today.',
      'Save one supportive habit so you can repeat it later.',
    ];
  }

  return [
    'Use a short journal note to clarify what you need next.',
    'Pick a small support action if stress starts to build.',
  ];
}

export async function analyzeLocalEchoTranscript(transcript: string): Promise<LocalEchoAnalysis> {
  const normalized = transcript.trim();

  if (!normalized) {
    return {
      transcript: '',
      sentiment: { label: 'Neutral', score: 0, matchedTerms: [] },
      safety: { label: 'low', score: 0, matchedTerms: [] },
      recommendations: ['Add or dictate a short transcript to enable local analysis.'],
      escalation: {
        urgency: 'routine',
        rationale: ['No transcript available for risk assessment yet.'],
        resources: [resourceCatalog.peer],
      },
      analysisEngine: 'rules-keyword',
    };
  }

  const runtimeProvider = await getRuntimeProvider();
  const baseSentiment = sentimentClassifier.classify(normalized);
  const baseSafety = safetyClassifier.classify(normalized);
  const runtimeSentiment = runtimeProvider ? await runtimeProvider.classifySentiment(normalized) : null;
  const runtimeSafety = runtimeProvider ? await runtimeProvider.classifySafety(normalized) : null;

  const sentiment: LabelScore<SentimentLabel> = runtimeSentiment
    ? {
        ...runtimeSentiment,
        score: Math.max(runtimeSentiment.score, toRangeScore(baseSentiment.matchedTerms.length, 3)),
        matchedTerms: baseSentiment.matchedTerms,
      }
    : baseSentiment;

  const safety: LabelScore<SafetyLevel> = runtimeSafety
    ? {
        ...runtimeSafety,
        score: Math.max(runtimeSafety.score, toRangeScore(baseSafety.matchedTerms.length, 2.5)),
        matchedTerms: baseSafety.matchedTerms,
      }
    : baseSafety;

  if (safety.label === 'high') {
    const escalation = deriveEscalation(safety, sentiment, normalized);
    return {
      transcript: normalized,
      sentiment,
      safety,
      recommendations: buildRecommendations(sentiment.label, safety.label, escalation.urgency),
      escalation,
      analysisEngine: runtimeProvider ? runtimeProvider.id : 'rules-keyword',
    };
  }

  if (safety.label === 'low' && sentiment.label === 'Negative' && /hopeless|worthless|trapped/.test(normalize(normalized))) {
    const elevatedSafety: LabelScore<SafetyLevel> = {
      label: 'medium',
      score: Math.max(safety.score, 0.67),
      matchedTerms: Array.from(new Set([...safety.matchedTerms, ...collectMatches(normalize(normalized), safetyRules.medium)])),
    };
    const escalation = deriveEscalation(elevatedSafety, sentiment, normalized);

    return {
      transcript: normalized,
      sentiment,
      safety: elevatedSafety,
      recommendations: buildRecommendations(sentiment.label, 'medium', escalation.urgency),
      escalation,
      analysisEngine: runtimeProvider ? runtimeProvider.id : 'rules-keyword',
    };
  }

  const escalation = deriveEscalation(safety, sentiment, normalized);

  return {
    transcript: normalized,
    sentiment,
    safety,
    recommendations: buildRecommendations(sentiment.label, safety.label, escalation.urgency),
    escalation,
    analysisEngine: runtimeProvider ? runtimeProvider.id : 'rules-keyword',
  };
}