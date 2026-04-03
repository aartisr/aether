"use client";
import React, { useState } from 'react';

import { analyzeLocalEchoTranscript, deriveEchoEmotionProfile, type EmotionalZone, type LocalEchoAnalysis, type TranscriptSource } from '../../lib/local-ai';

const MIN_TRANSCRIPT_WORDS = 3;

function countWords(input: string) {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function formatConfidence(confidence: number) {
  if (confidence >= 0.75) return 'High confidence';
  if (confidence >= 0.5) return 'Moderate confidence';
  return 'Low confidence';
}

function formatValenceTone(value: number) {
  if (value <= -0.6) return 'Strongly negative';
  if (value <= -0.2) return 'Leaning negative';
  if (value < 0.2) return 'Near neutral';
  if (value < 0.6) return 'Leaning positive';
  return 'Strongly positive';
}

function formatEnergyTone(value: number) {
  if (value < 0.34) return 'Low energy';
  if (value < 0.67) return 'Moderate energy';
  return 'High energy';
}

function formatTrend(previous: number | null, current: number) {
  if (previous === null) return 'First reading';
  const delta = current - previous;
  if (Math.abs(delta) < 0.08) return 'Holding steady';
  return delta > 0 ? 'Shifting more positive' : 'Shifting more negative';
}

function getZoneGuidance(zone: EmotionalZone, confidence: number) {
  const lowConfidenceSuffix = confidence < 0.5 ? ' Signals are mixed, so treat this as a light steer rather than a verdict.' : '';

  if (zone === 'Grounded') {
    return {
      title: 'Protect what is working',
      description: `You appear steadier and lower intensity right now. Consolidate the habits or people helping you stay level.${lowConfidenceSuffix}`,
      accentClassName: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    };
  }

  if (zone === 'Energized') {
    return {
      title: 'Channel the momentum',
      description: `You appear positive with usable activation. Turn that energy into one concrete next step before it diffuses.${lowConfidenceSuffix}`,
      accentClassName: 'border-amber-200 bg-amber-50 text-amber-900',
    };
  }

  if (zone === 'Overwhelmed') {
    return {
      title: 'Lower intensity first',
      description: `Your signals suggest activated distress. De-escalate the body load before trying to solve the whole situation.${lowConfidenceSuffix}`,
      accentClassName: 'border-sky-200 bg-sky-50 text-sky-900',
    };
  }

  return {
    title: 'Reduce load and restore',
    description: `Your signals suggest low-energy distress or depletion. Favor recovery, simplification, and support over performance right now.${lowConfidenceSuffix}`,
    accentClassName: 'border-slate-200 bg-slate-100 text-slate-900',
  };
}

/**
 * SentimentMapping
 * A generic, accessible sentiment analysis UI for audio or text input.
 *
 * @param audio Audio Blob to analyze
 * @param analyzeLabel Custom label for the analyze button
 * @param className Optional className for container
 */
function defaultAnalyzeSentiment(input: { audio: Blob | null; transcript: string }): Promise<LocalEchoAnalysis> {
  void input.audio;
  return analyzeLocalEchoTranscript(input.transcript);
}

export default function SentimentMapping({
  audio,
  transcript = '',
  transcriptSource = 'unavailable',
  analyzeLabel = 'Analyze Check-In',
  className = '',
  analyzeSentiment = defaultAnalyzeSentiment,
}: {
  audio: Blob | null;
  transcript?: string;
  transcriptSource?: TranscriptSource;
  analyzeLabel?: string;
  className?: string;
  analyzeSentiment?: (input: { audio: Blob | null; transcript: string }) => Promise<LocalEchoAnalysis>;
}) {
  const [editableTranscript, setEditableTranscript] = useState(transcript);
  const [result, setResult] = useState<LocalEchoAnalysis | null>(null);
  const [previousValence, setPreviousValence] = useState<number | null>(null);
  const [showEmotionMap, setShowEmotionMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasAnalyzedOnce, setHasAnalyzedOnce] = useState(false);
  const [showWarmupHint, setShowWarmupHint] = useState(false);
  const warmupTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = countWords(editableTranscript);
  const wordsNeeded = Math.max(0, MIN_TRANSCRIPT_WORDS - wordCount);
  const canAnalyze = wordsNeeded === 0;

  const transcriptStatus = canAnalyze
    ? 'Transcript ready. You can analyze this check-in.'
    : audio && transcriptSource === 'unavailable' && wordCount === 0
      ? `No transcript was detected from recording. Type at least ${MIN_TRANSCRIPT_WORDS} words to continue.`
      : wordCount > 0
        ? `Add ${wordsNeeded} more word${wordsNeeded === 1 ? '' : 's'} to enable analysis.`
        : `Record or type at least ${MIN_TRANSCRIPT_WORDS} words to enable analysis.`;

  React.useEffect(() => {
    setEditableTranscript(transcript);
  }, [transcript]);

  React.useEffect(() => () => {
    if (warmupTimerRef.current) {
      clearTimeout(warmupTimerRef.current);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setAnalysisError(null);
    setShowWarmupHint(false);

    if (!hasAnalyzedOnce) {
      warmupTimerRef.current = setTimeout(() => {
        setShowWarmupHint(true);
      }, 1200);
    }

    setResult(null);

    try {
      const res = await analyzeSentiment({ audio, transcript: editableTranscript });

      if (warmupTimerRef.current) {
        clearTimeout(warmupTimerRef.current);
        warmupTimerRef.current = null;
      }

      setPreviousValence(result ? deriveEchoEmotionProfile(result).valence : null);
      setResult(res);
      setShowEmotionMap(false);
      setHasAnalyzedOnce(true);
      setShowWarmupHint(false);
      setLoading(false);
    } catch {
      if (warmupTimerRef.current) {
        clearTimeout(warmupTimerRef.current);
        warmupTimerRef.current = null;
      }

      setShowWarmupHint(false);
      setLoading(false);
      setAnalysisError('Local analysis is unavailable right now. Please try again.');
    }
  };

  const emotionProfile = result ? deriveEchoEmotionProfile(result) : null;
  const valence = emotionProfile?.valence ?? 0;
  const energy = emotionProfile?.energy ?? 0;
  const confidence = emotionProfile?.confidence ?? 0;
  const valencePercent = ((valence + 1) / 2) * 100;
  const previousValencePercent = previousValence === null ? null : ((previousValence + 1) / 2) * 100;
  const energyPercentFromTop = (1 - energy) * 100;
  const quadrantName = emotionProfile?.zone;
  const trendLabel = result ? formatTrend(previousValence, valence) : '';
  const confidenceBandRadius = 11 - confidence * 6;
  const confidenceBandOpacity = 0.18 + confidence * 0.16;
  const zoneGuidance = emotionProfile ? getZoneGuidance(emotionProfile.zone, confidence) : null;
  const quadrantAriaLabel = (quadrantName ?? 'this').toLowerCase();
  const summaryLine = result
    ? `${formatValenceTone(valence)} and ${formatEnergyTone(energy).toLowerCase()}. ${formatConfidence(confidence)}.`
    : '';

  return (
    <div className={`mt-6 flex flex-col items-center gap-2 ${className}`}>
      <label className="w-full max-w-xl text-left text-sm font-medium text-slate-700" htmlFor="echo-transcript">
        Transcript for local analysis
      </label>
      <textarea
        id="echo-transcript"
        className="min-h-32 w-full max-w-xl rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={editableTranscript}
        onChange={(event) => setEditableTranscript(event.target.value)}
        placeholder="Your local transcript will appear here. You can also type or edit it manually."
      />
      <button
        className="px-4 py-2 bg-indigo-400 text-white rounded shadow hover:bg-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        onClick={handleAnalyze}
        disabled={!canAnalyze || loading}
        aria-label={analyzeLabel}
      >
        {loading ? (
          <span className="animate-pulse">Analyzing...</span>
        ) : (
          analyzeLabel
        )}
      </button>
      <p className="w-full max-w-xl text-left text-xs text-slate-500" aria-live="polite">
        {loading ? (showWarmupHint ? 'Model warming up locally...' : 'Analyzing check-in locally...') : transcriptStatus}
      </p>
      {analysisError && (
        <p className="w-full max-w-xl text-left text-xs text-amber-700" aria-live="polite">
          {analysisError}
        </p>
      )}
      {result && (
        <div className="mt-2 w-full max-w-xl rounded-xl border border-indigo-100 bg-white p-4 shadow-sm" aria-live="polite">
          {(result.safety.label === 'medium' || result.safety.label === 'high') && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Elevated safety signal detected. Suggested support actions are prioritized below.
            </div>
          )}

          <div className="text-lg font-semibold text-indigo-700">
            Sentiment Rail
          </div>

          <div
            className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
            role="img"
            aria-label={`Sentiment rail showing ${formatValenceTone(valence).toLowerCase()}`}
            data-testid="sentiment-rail"
          >
            <svg viewBox="0 0 100 28" className="h-12 w-full overflow-visible" aria-hidden="true">
              <defs>
                <linearGradient id="echoSentimentRailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <line x1="6" y1="14" x2="94" y2="14" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <line x1="6" y1="14" x2="94" y2="14" stroke="url(#echoSentimentRailGradient)" strokeWidth="8" strokeLinecap="round" />
              <line x1="50" y1="5" x2="50" y2="23" stroke="#475569" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="6" y1="9" x2="6" y2="19" stroke="#94a3b8" strokeWidth="1" />
              <line x1="94" y1="9" x2="94" y2="19" stroke="#94a3b8" strokeWidth="1" />
              {previousValencePercent !== null && (
                <circle cx={6 + (previousValencePercent * 0.88)} cy="14" r="3.2" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
              )}
              <circle
                cx={6 + (valencePercent * 0.88)}
                cy="14"
                r="4.6"
                fill={confidence < 0.5 ? '#ffffff' : '#c7d2fe'}
                stroke={confidence < 0.5 ? '#64748b' : '#4338ca'}
                strokeWidth="1.8"
              />
            </svg>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>Negative</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-slate-500 shadow-sm">Neutral</span>
              <span>Positive</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{formatValenceTone(valence)}</span>
              <span>{trendLabel}</span>
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-700">
            {summaryLine}
          </div>

          <div className="mt-2 text-sm text-slate-700">
            Safety signal: <span className="font-semibold uppercase">{result.safety.label}</span> ({result.safety.score.toFixed(2)})
          </div>

          <div className="mt-1 text-sm text-slate-700">
            Escalation urgency: <span className="font-semibold uppercase">{result.escalation.urgency}</span>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setShowEmotionMap((current) => !current)}
            >
              {showEmotionMap ? 'Hide emotional map' : 'Show emotional map'}
            </button>
          </div>

          {showEmotionMap && (
            <div className="mt-3 rounded-lg border border-slate-200 p-3" data-testid="emotion-compass">
              <div className="text-sm font-semibold text-slate-700">Emotion Compass</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="rounded bg-sky-50 px-2 py-1">Overwhelmed</div>
                <div className="rounded bg-amber-50 px-2 py-1">Energized</div>
                <div className="rounded bg-slate-100 px-2 py-1">Drained</div>
                <div className="rounded bg-emerald-50 px-2 py-1">Grounded</div>
              </div>
              <div className="mt-3 flex justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="h-52 w-52"
                  role="img"
                  aria-label={`Emotion compass in ${quadrantAriaLabel} zone`}
                >
                  <rect x="2" y="2" width="48" height="48" rx="18" fill="#f0f9ff" />
                  <rect x="50" y="2" width="48" height="48" rx="18" fill="#fffbeb" />
                  <rect x="2" y="50" width="48" height="48" rx="18" fill="#f8fafc" />
                  <rect x="50" y="50" width="48" height="48" rx="18" fill="#ecfdf5" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="50" y1="2" x2="50" y2="98" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="50" y="9" textAnchor="middle" fontSize="4.2" fill="#64748b">High energy</text>
                  <text x="50" y="96" textAnchor="middle" fontSize="4.2" fill="#64748b">Low energy</text>
                  <text x="6" y="54" textAnchor="start" fontSize="4.2" fill="#64748b">Negative</text>
                  <text x="94" y="54" textAnchor="end" fontSize="4.2" fill="#64748b">Positive</text>
                  <circle
                    cx={valencePercent}
                    cy={energyPercentFromTop}
                    r={confidenceBandRadius}
                    fill="#818cf8"
                    opacity={confidenceBandOpacity}
                    stroke="#6366f1"
                    strokeOpacity={0.38}
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                  <circle cx={valencePercent} cy={energyPercentFromTop} r="5.2" fill="#ffffff" stroke="#4338ca" strokeWidth="1.4" />
                  <circle cx={valencePercent} cy={energyPercentFromTop} r="2.6" fill="#818cf8" />
                </svg>
              </div>
              <div className="mt-2 text-center text-sm text-slate-700">
                Current zone: <span className="font-semibold">{quadrantName}</span>
              </div>
              <div className="mt-1 text-center text-xs text-slate-500">
                {formatValenceTone(valence)} • {formatEnergyTone(energy)}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-indigo-500 bg-indigo-300/40" aria-hidden="true" />
                <span>Confidence band: {formatConfidence(confidence)}</span>
              </div>
            </div>
          )}

          <div className="mt-3 text-sm text-slate-600">
            Matched terms: {[...result.sentiment.matchedTerms, ...result.safety.matchedTerms].join(', ') || 'None'}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Engine: {result.analysisEngine}
          </div>
          {result.analysisEngineNote && (
            <div className="mt-1 text-xs text-amber-700">
              {result.analysisEngineNote}
            </div>
          )}
          {zoneGuidance && (
            <div className={`mt-4 rounded-md border px-3 py-3 text-left ${zoneGuidance.accentClassName}`}>
              <div className="text-xs font-semibold uppercase tracking-wide">{zoneGuidance.title}</div>
              <p className="mt-1 text-sm">{zoneGuidance.description}</p>
            </div>
          )}
          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Recommended next steps for {quadrantName ?? 'this'} zone
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {result.recommendations.map((recommendation) => (
              <li key={recommendation} className="rounded-md bg-slate-50 px-3 py-2">
                {recommendation}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-left">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Suggested support actions</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {result.escalation.resources.map((resource) => (
                <li key={resource.id}>
                  <a className="font-medium text-indigo-700 hover:text-indigo-800" href={resource.actionHref}>
                    {resource.actionLabel}
                  </a>
                  <div className="text-xs text-slate-500">
                    {resource.title} • {resource.availability}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-400 max-w-sm text-center mt-1">
        <span role="img" aria-label="lock">🔒</span> All analysis is performed locally for privacy. No audio or data is sent to a server.
      </div>
    </div>
  );
}
