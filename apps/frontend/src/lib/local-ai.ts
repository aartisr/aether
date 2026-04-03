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
  analysisEngineNote?: string;
};

type Token = {
  value: string;
  normalized: string;
  start: number;
  end: number;
  isWord: boolean;
  isAllCaps: boolean;
};

type LexiconKind = 'positive' | 'negative' | 'high-risk' | 'risk' | 'immediacy' | 'protective';

type WeightedLexiconEntry = {
  kind: LexiconKind;
  terms: string[];
  weight: number;
  negatedWeight?: number;
  invertOnNegation?: boolean;
};

type WeightedHit = {
  kind: LexiconKind;
  term: string;
  source: string;
  start: number;
  end: number;
  baseWeight: number;
  adjustedWeight: number;
};

type EmotionalZone = 'Grounded' | 'Energized' | 'Overwhelmed' | 'Drained';

type RuleSet<TLabel extends string> = Record<TLabel, string[]>;

const NEGATION_TERMS = new Set([
  'not',
  'no',
  'never',
  'none',
  'nobody',
  'nothing',
  'nowhere',
  'without',
  'hardly',
  'rarely',
  'seldom',
  'cannot',
  "can't",
  "don't",
  "didn't",
  "won't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
]);

const BOOSTER_WEIGHTS: Record<string, number> = {
  absolutely: 0.3,
  deeply: 0.28,
  especially: 0.16,
  extremely: 0.34,
  incredibly: 0.34,
  intensely: 0.22,
  more: 0.12,
  really: 0.2,
  seriously: 0.24,
  so: 0.14,
  super: 0.22,
  too: 0.14,
  very: 0.24,
};

const COMPOUND_BOOSTER_WEIGHTS: Record<string, number> = {
  'a bit': -0.18,
  'a little': -0.18,
  'kind of': -0.22,
  'sort of': -0.22,
  'just a little': -0.2,
};

const CONTRAST_TERMS = new Set(['but', 'however', 'though', 'although', 'yet', 'still']);

const sentimentLexicon: WeightedLexiconEntry[] = [
  {
    kind: 'positive',
    weight: 2.8,
    terms: ['hopeful', 'grateful', 'grounded', 'relieved', 'supported', 'calmer', 'peaceful'],
  },
  {
    kind: 'positive',
    weight: 2.2,
    terms: ['calm', 'connected', 'steady', 'stable', 'safe', 'okay', 'ok', 'alright', 'better', 'coping', 'manageable'],
  },
  {
    kind: 'positive',
    weight: 2.3,
    terms: ['motivated', 'ready', 'energized', 'determined', 'focused', 'encouraged', 'settled', 'capable'],
  },
  {
    kind: 'positive',
    weight: 1.7,
    terms: ['good', 'fine', 'proud', 'confident', 'encouraged', 'rested', 'clear'],
  },
  {
    kind: 'positive',
    weight: 1.8,
    terms: ['hanging in there', "can't complain", 'not bad'],
    invertOnNegation: false,
  },
  {
    kind: 'negative',
    weight: 1.5,
    terms: ['tired', 'down', 'off', 'uneasy', 'low', 'shaky'],
  },
  {
    kind: 'negative',
    weight: 2.2,
    terms: [
      'stressed',
      'worried',
      'anxious',
      'upset',
      'drained',
      'lonely',
      'alone',
      'tense',
      'sad',
      'frustrated',
      'numb',
      'disconnected',
      'exhausted',
      'flat',
      'heavy',
      'shutdown',
      'shut down',
      'burned out',
      'burnt out',
      'on edge',
    ],
  },
  {
    kind: 'negative',
    weight: 3,
    terms: [
      'overwhelmed',
      'panic',
      'panicked',
      'panicky',
      'spiraling',
      'hopeless',
      'worthless',
      'trapped',
      'ashamed',
      'guilty',
      'drowning',
      'falling apart',
      "can't cope",
      'cannot cope',
      "can't do this",
      'cannot do this',
    ],
  },
];

const safetyLexicon: WeightedLexiconEntry[] = [
  {
    kind: 'high-risk',
    weight: 5.6,
    terms: [
      'kill myself',
      'hurt myself',
      'end my life',
      'take my life',
      'want to die',
      'do not want to live',
      "don't want to live",
      'better off dead',
      'no reason to live',
      'not worth living',
      'wish i was dead',
      'suicidal',
      'suicide',
      'self harm',
      'self-harm',
    ],
    negatedWeight: -1.8,
  },
  {
    kind: 'risk',
    weight: 2.8,
    terms: [
      "can't go on",
      'cannot go on',
      "can't do this anymore",
      'cannot do this anymore',
      "can't keep myself safe",
      'cannot keep myself safe',
      'unsafe',
      'not safe',
      'no one to talk to',
      'nobody to talk to',
      'all alone',
      'completely alone',
      'everyone would be better off without me',
      'better off without me',
      'burden to everyone',
      'feel like a burden',
      'hopeless',
      'trapped',
      'spiraling',
      'falling apart',
      "can't cope",
      'cannot cope',
    ],
    negatedWeight: -0.9,
  },
  {
    kind: 'immediacy',
    weight: 1.8,
    terms: ['right now', 'tonight', 'today', 'immediately', 'plan', 'means', 'pills', 'knife', 'bridge', 'goodbye'],
    negatedWeight: -0.4,
  },
  {
    kind: 'protective',
    weight: -1.8,
    terms: [
      'safe right now',
      "i'm safe",
      'i am safe',
      'not alone',
      'with my friend',
      'with a friend',
      'with my roommate',
      'with family',
      'texted my counselor',
      'called my therapist',
      'reaching out',
      'safety plan',
      'grounding',
      'breathing',
      'support system',
    ],
    negatedWeight: 1.2,
    invertOnNegation: true,
  },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function collectMatches(text: string, terms: string[]) {
  return terms.filter((term) => text.includes(term));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeComposite(total: number, alpha = 15) {
  if (total === 0) return 0;
  return total / Math.sqrt(total * total + alpha);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenize(text: string): Token[] {
  const tokenPattern = /[A-Za-z]+(?:'[A-Za-z]+)?|[!?]+|[.,;:()]|\S/g;
  const tokens: Token[] = [];

  for (const match of text.matchAll(tokenPattern)) {
    const value = match[0];
    const start = match.index ?? 0;
    const end = start + value.length;
    const isWord = /[A-Za-z]/.test(value);
    const lettersOnly = value.replace(/[^A-Za-z]/g, '');
    tokens.push({
      value,
      normalized: normalize(value),
      start,
      end,
      isWord,
      isAllCaps: lettersOnly.length > 1 && lettersOnly === lettersOnly.toUpperCase(),
    });
  }

  return tokens;
}

function overlapExists(hits: WeightedHit[], start: number, end: number) {
  return hits.some((hit) => Math.max(hit.start, start) < Math.min(hit.end, end));
}

function getPreviousWordTokens(tokens: Token[], start: number, count = 3) {
  return tokens.filter((token) => token.isWord && token.end <= start).slice(-count);
}

function getBoosterAdjustment(previousWords: Token[]) {
  const tokenAdjustment = previousWords.reduce((sum, token) => sum + (BOOSTER_WEIGHTS[token.normalized] ?? 0), 0);
  const joined = previousWords.map((token) => token.normalized).join(' ');
  const compoundAdjustment = Object.entries(COMPOUND_BOOSTER_WEIGHTS).reduce((sum, [phrase, value]) => {
    return joined.includes(phrase) ? sum + value : sum;
  }, 0);

  return clamp(tokenAdjustment + compoundAdjustment, -0.45, 0.75);
}

function buildWeightedHits(text: string, lexicon: WeightedLexiconEntry[]) {
  const tokens = tokenize(text);
  const contrastBoundary = tokens
    .filter((token) => token.isWord && CONTRAST_TERMS.has(token.normalized))
    .map((token) => token.start)
    .pop();
  const exclamationBoost = Math.min((text.match(/!/g) ?? []).length, 4) * 0.04;
  const rawHits: WeightedHit[] = [];

  for (const entry of lexicon) {
    for (const term of entry.terms) {
      const pattern = new RegExp(`\\b${escapeRegex(term).replace(/\\ /g, '\\s+')}\\b`, 'gi');

      for (const match of text.matchAll(pattern)) {
        const start = match.index ?? 0;
        const source = text.slice(start, start + match[0].length);
        const end = start + match[0].length;
        const previousWords = getPreviousWordTokens(tokens, start);
        const negated = previousWords.some((token) => NEGATION_TERMS.has(token.normalized));
        const boosterAdjustment = getBoosterAdjustment(previousWords);
        const capsBoost = /[A-Za-z]/.test(source) && source === source.toUpperCase() ? 0.12 : 0;
        const emphasisMultiplier = clamp(1 + boosterAdjustment + exclamationBoost + capsBoost, 0.45, 1.85);
        const contrastMultiplier = contrastBoundary === undefined ? 1 : start > contrastBoundary ? 1.28 : 0.74;
        const baseWeight = negated
          ? entry.negatedWeight ?? (entry.invertOnNegation === false ? entry.weight * 0.35 : -entry.weight * 0.82)
          : entry.weight;

        rawHits.push({
          kind: entry.kind,
          term,
          source,
          start,
          end,
          baseWeight: entry.weight,
          adjustedWeight: baseWeight * emphasisMultiplier * contrastMultiplier,
        });
      }
    }
  }

  const sortedHits = rawHits.sort((left, right) => {
    const widthDifference = right.source.length - left.source.length;
    if (widthDifference !== 0) return widthDifference;

    return Math.abs(right.adjustedWeight) - Math.abs(left.adjustedWeight);
  });

  return sortedHits.reduce<WeightedHit[]>((kept, hit) => {
    if (overlapExists(kept, hit.start, hit.end)) {
      return kept;
    }

    kept.push(hit);
    return kept;
  }, []);
}

function summarizeHits(hits: WeightedHit[], maxTerms = 6) {
  const uniqueTerms = new Set<string>();

  for (const hit of [...hits].sort((left, right) => Math.abs(right.adjustedWeight) - Math.abs(left.adjustedWeight))) {
    const normalizedSource = normalize(hit.source.replace(/[!?.,;:()]+/g, ' '));
    if (!normalizedSource) continue;

    uniqueTerms.add(normalizedSource);
    if (uniqueTerms.size >= maxTerms) {
      break;
    }
  }

  return [...uniqueTerms];
}

function safetySeverity(label: SafetyLevel) {
  if (label === 'high') return 3;
  if (label === 'medium') return 2;
  return 1;
}

function mergeMatchedTerms(...termSets: string[][]) {
  return Array.from(new Set(termSets.flat())).slice(0, 8);
}

type RuntimeProvider = {
  id: string;
  classifySentiment(input: string): Promise<LabelScore<SentimentLabel>>;
  classifySafety(input: string): Promise<LabelScore<SafetyLevel>>;
};

type SentimentResultItem = {
  label?: unknown;
  score?: unknown;
};

type ZeroShotResult = {
  labels?: unknown;
  scores?: unknown;
};

type ZeroShotPipeline = (input: string, labels: string[]) => Promise<ZeroShotResult>;
type SentimentPipeline = (input: string) => Promise<SentimentResultItem[] | SentimentResultItem>;

type TransformersModule = {
  pipeline?: (task: string, model: string) => Promise<ZeroShotPipeline>;
};

function isTransformersModule(value: unknown): value is TransformersModule {
  return typeof value === 'object' && value !== null && 'pipeline' in value;
}

let runtimeProviderPromise: Promise<RuntimeProvider | null> | null = null;
let runtimeProviderInitError: string | null = null;
const ENABLE_BROWSER_LOCAL_MODELS = process.env.NEXT_PUBLIC_ECHO_ENABLE_BROWSER_MODELS === 'true';

function formatRuntimeError(err: unknown) {
  if (err instanceof Error) {
    const compact = err.message.trim();
    return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
  }
  return 'Unknown initialization error.';
}

function buildEngineFallbackNote() {
  if (!ENABLE_BROWSER_LOCAL_MODELS) {
    return 'Using weighted on-device fallback analysis. Set NEXT_PUBLIC_ECHO_ENABLE_BROWSER_MODELS=true to enable browser model loading.';
  }

  if (!runtimeProviderInitError) {
    return 'Browser-local model not active yet; using weighted rules fallback.';
  }

  return `Browser-local model unavailable; using weighted rules fallback. Reason: ${runtimeProviderInitError}`;
}

async function tryCreateTransformersRuntimeProvider(): Promise<RuntimeProvider | null> {
  try {
    runtimeProviderInitError = null;
    const importedModule = await import('@xenova/transformers/dist/transformers.min.js');
    if (!isTransformersModule(importedModule)) {
      return null;
    }

    const createPipeline = importedModule.pipeline;

    if (!createPipeline) {
      return null;
    }

    const zeroShot = await createPipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
    const sentimentPipeline = (await createPipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    )) as unknown as SentimentPipeline;

    const safetyLabels = [
      'immediate self-harm risk',
      'high emotional danger',
      'moderate emotional distress',
      'low emotional risk',
    ];

    const mapSentiment = (item: SentimentResultItem): LabelScore<SentimentLabel> => {
      const rawLabel = typeof item.label === 'string' ? item.label.toLowerCase() : '';
      const rawScore = typeof item.score === 'number' ? item.score : 0;

      if (rawLabel.includes('negative')) {
        return { label: 'Negative', score: rawScore, matchedTerms: [] };
      }

      if (rawLabel.includes('positive')) {
        return { label: 'Positive', score: rawScore, matchedTerms: [] };
      }

      return { label: 'Neutral', score: rawScore, matchedTerms: [] };
    };

    const mapSafety = (labels: unknown[], scores: unknown[]): LabelScore<SafetyLevel> => {
      const topLabel = typeof labels[0] === 'string' ? labels[0].toLowerCase() : '';
      const topScore = typeof scores[0] === 'number' ? scores[0] : 0;

      if (topLabel.includes('immediate') || topLabel.includes('high')) {
        return { label: 'high', score: topScore, matchedTerms: [] };
      }

      if (topLabel.includes('moderate')) {
        return { label: 'medium', score: topScore, matchedTerms: [] };
      }

      return { label: 'low', score: topScore, matchedTerms: [] };
    };

    return {
      id: 'transformers-local-hybrid',
      async classifySentiment(input: string) {
        const raw = await sentimentPipeline(input);
        const first = Array.isArray(raw) ? raw[0] : raw;
        return mapSentiment(first ?? {});
      },
      async classifySafety(input: string) {
        const result = await zeroShot(input, safetyLabels);
        const predictedLabels = Array.isArray(result?.labels) ? result.labels : [];
        const scores = Array.isArray(result?.scores) ? result.scores : [];

        return mapSafety(predictedLabels, scores);
      },
    };
  } catch (error) {
    runtimeProviderInitError = formatRuntimeError(error);
    return null;
  }
}

async function getRuntimeProvider() {
  if (!ENABLE_BROWSER_LOCAL_MODELS) {
    return null;
  }

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

class SentimentRuleEngine {
  analyze(input: string): LabelScore<SentimentLabel> {
    const hits = buildWeightedHits(input, sentimentLexicon);
    const positiveTotal = hits
      .filter((hit) => hit.kind === 'positive' && hit.adjustedWeight > 0)
      .reduce((sum, hit) => sum + hit.adjustedWeight, 0);
    const negativeTotal = hits
      .filter((hit) => hit.kind === 'negative' && hit.adjustedWeight > 0)
      .reduce((sum, hit) => sum + hit.adjustedWeight, 0);
    const compound = normalizeComposite(positiveTotal - negativeTotal);
    const score = clamp(Math.abs(compound), 0, 1);
    const mixedSignals = positiveTotal > 1.75 && negativeTotal > 1.75 && Math.abs(compound) < 0.18;

    let label: SentimentLabel = 'Neutral';
    if (!mixedSignals && compound >= 0.22) {
      label = 'Positive';
    } else if (!mixedSignals && compound <= -0.22) {
      label = 'Negative';
    }

    return {
      label,
      score,
      matchedTerms: summarizeHits(hits),
    };
  }
}

class SafetyRuleEngine {
  analyze(input: string): LabelScore<SafetyLevel> {
    const hits = buildWeightedHits(input, safetyLexicon);
    const netRisk = hits.reduce((sum, hit) => sum + hit.adjustedWeight, 0);
    const normalizedRisk = clamp(normalizeComposite(Math.max(netRisk, 0), 10), 0, 1);
    const highRiskDetected = hits.some((hit) => hit.kind === 'high-risk' && hit.adjustedWeight > 0);
    const immediacyDetected = hits.some((hit) => hit.kind === 'immediacy' && hit.adjustedWeight > 0);
    const meaningfulRisk = hits.filter((hit) => hit.adjustedWeight > 0).reduce((sum, hit) => sum + hit.adjustedWeight, 0);

    let label: SafetyLevel = 'low';
    let score = normalizedRisk;

    if (highRiskDetected) {
      label = 'high';
      score = Math.max(0.92, normalizedRisk);
    } else if (normalizedRisk >= 0.42 || meaningfulRisk >= 2.8 || (meaningfulRisk >= 1.6 && immediacyDetected)) {
      label = 'medium';
      score = Math.max(0.45, normalizedRisk);
    }

    return {
      label,
      score,
      matchedTerms: summarizeHits(hits),
    };
  }
}

const sentimentClassifier = new SentimentRuleEngine();
const safetyClassifier = new SafetyRuleEngine();

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

  const immediateContext = /(right now|tonight|today|immediately|plan|means|alone|pills|knife|bridge)/.test(normalized);
  const sustainedDistress = /(every day|all day|for weeks|for months|constantly|most days|lately)/.test(normalized);

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

function inferRecommendationZone(
  transcript: string,
  sentiment: SentimentLabel,
  safety: SafetyLevel,
  urgency: 'routine' | 'same-day' | 'immediate',
): EmotionalZone {
  const normalized = normalize(transcript);
  const highEnergyDistressLanguage = /(panic|panicked|racing|right now|urgent|overwhelmed|can't breathe|cannot breathe|spiraling|on edge|trapped)/.test(normalized);
  const highEnergyPositiveLanguage = /(excited|motivated|ready|energized|determined|focused|hopeful now)/.test(normalized);
  const lowEnergyLanguage = /(drained|numb|tired|exhausted|empty|shutdown|shut down|flat|heavy)/.test(normalized);
  const calmingLanguage = /(grounded|steady|calm|safe right now|breathing|relieved|settled|supported|manageable)/.test(normalized);

  if (urgency === 'immediate') {
    return highEnergyDistressLanguage && !lowEnergyLanguage ? 'Overwhelmed' : 'Drained';
  }

  if (urgency === 'same-day' || safety === 'medium' || safety === 'high') {
    if (lowEnergyLanguage && !highEnergyDistressLanguage) {
      return 'Drained';
    }

    return 'Overwhelmed';
  }

  if (highEnergyPositiveLanguage) {
    return 'Energized';
  }

  if (lowEnergyLanguage) {
    return 'Drained';
  }

  if (highEnergyDistressLanguage) {
    return 'Overwhelmed';
  }

  if (sentiment === 'Positive') {
    return calmingLanguage ? 'Grounded' : 'Energized';
  }

  if (sentiment === 'Negative') {
    return 'Drained';
  }

  return calmingLanguage ? 'Grounded' : 'Overwhelmed';
}

function buildRecommendations(
  transcript: string,
  sentiment: SentimentLabel,
  safety: SafetyLevel,
  urgency: 'routine' | 'same-day' | 'immediate',
) {
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

  const zone = inferRecommendationZone(transcript, sentiment, safety, urgency);

  if (safety === 'medium') {
    return [
      'Pause and ground yourself with one small physical reset.',
      'Message one trusted person before this feeling compounds.',
      'Pick one support option from the resilience pathway today.',
    ];
  }

  if (zone === 'Grounded') {
    return [
      'Protect the habits or people that are helping you stay steady.',
      'Capture one specific thing that is working so you can repeat it later.',
      'Use this calmer window for one low-pressure supportive next step.',
    ];
  }

  if (zone === 'Energized') {
    return [
      'Turn this momentum into one concrete next step before it diffuses.',
      'Aim your energy at a single task instead of opening too many loops.',
      'Keep one grounding habit nearby so activation stays usable.',
    ];
  }

  if (zone === 'Overwhelmed') {
    return [
      'Lower intensity first with one short grounding or breathing reset.',
      'Narrow the problem to the next 10 minutes instead of the whole situation.',
      'Bring in support early so you do not have to carry the spike alone.',
    ];
  }

  return [
    'Reduce load before asking yourself for more output.',
    'Choose one restorative action that is realistic at your current energy level.',
    'Let one trusted person know today feels heavier than usual.',
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
      analysisEngineNote: buildEngineFallbackNote(),
    };
  }

  const runtimeProvider = await getRuntimeProvider();
  const baseSentiment = sentimentClassifier.analyze(normalized);
  const baseSafety = safetyClassifier.analyze(normalized);
  const runtimeSentiment = runtimeProvider ? await runtimeProvider.classifySentiment(normalized) : null;
  const runtimeSafety = runtimeProvider ? await runtimeProvider.classifySafety(normalized) : null;

  const sentiment: LabelScore<SentimentLabel> = runtimeSentiment
    ? {
        label:
          baseSentiment.label !== 'Neutral' && baseSentiment.score >= runtimeSentiment.score + 0.1
            ? baseSentiment.label
            : runtimeSentiment.label,
        score: Math.max(runtimeSentiment.score, baseSentiment.score),
        matchedTerms: mergeMatchedTerms(baseSentiment.matchedTerms, runtimeSentiment.matchedTerms),
      }
    : baseSentiment;

  const safety: LabelScore<SafetyLevel> = runtimeSafety
    ? {
        label: safetySeverity(baseSafety.label) >= safetySeverity(runtimeSafety.label) ? baseSafety.label : runtimeSafety.label,
        score: Math.max(runtimeSafety.score, baseSafety.score),
        matchedTerms: mergeMatchedTerms(baseSafety.matchedTerms, runtimeSafety.matchedTerms),
      }
    : baseSafety;

  if (safety.label === 'high') {
    const escalation = deriveEscalation(safety, sentiment, normalized);
    return {
      transcript: normalized,
      sentiment,
      safety,
      recommendations: buildRecommendations(normalized, sentiment.label, safety.label, escalation.urgency),
      escalation,
      analysisEngine: runtimeProvider ? runtimeProvider.id : 'rules-keyword',
      analysisEngineNote: runtimeProvider ? undefined : buildEngineFallbackNote(),
    };
  }

  if (safety.label === 'low' && sentiment.label === 'Negative' && /hopeless|worthless|trapped/.test(normalize(normalized))) {
    const escalationTerms = collectMatches(normalize(normalized), ['hopeless', 'worthless', 'trapped']);
    const elevatedSafety: LabelScore<SafetyLevel> = {
      label: 'medium',
      score: Math.max(safety.score, 0.67),
      matchedTerms: Array.from(new Set([...safety.matchedTerms, ...escalationTerms])),
    };
    const escalation = deriveEscalation(elevatedSafety, sentiment, normalized);

    return {
      transcript: normalized,
      sentiment,
      safety: elevatedSafety,
      recommendations: buildRecommendations(normalized, sentiment.label, 'medium', escalation.urgency),
      escalation,
      analysisEngine: runtimeProvider ? runtimeProvider.id : 'rules-keyword',
      analysisEngineNote: runtimeProvider ? undefined : buildEngineFallbackNote(),
    };
  }

  const escalation = deriveEscalation(safety, sentiment, normalized);

  return {
    transcript: normalized,
    sentiment,
    safety,
    recommendations: buildRecommendations(normalized, sentiment.label, safety.label, escalation.urgency),
    escalation,
    analysisEngine: runtimeProvider ? runtimeProvider.id : 'rules-keyword',
    analysisEngineNote: runtimeProvider ? undefined : buildEngineFallbackNote(),
  };
}