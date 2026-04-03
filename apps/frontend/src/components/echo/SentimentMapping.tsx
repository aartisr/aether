"use client";
import React, { useState } from 'react';

import { analyzeLocalEchoTranscript, type LocalEchoAnalysis, type TranscriptSource } from '../../lib/local-ai';

const MIN_TRANSCRIPT_WORDS = 3;

function countWords(input: string) {
  return input.trim().split(/\s+/).filter(Boolean).length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

function formatQuadrantName(valence: number, energy: number) {
  if (valence >= 0 && energy >= 0.5) return 'Energized';
  if (valence >= 0 && energy < 0.5) return 'Grounded';
  if (valence < 0 && energy >= 0.5) return 'Overwhelmed';
  return 'Drained';
}

function toValence(signal: LocalEchoAnalysis['sentiment']) {
  const signedScore = signal.label === 'Positive' ? signal.score : signal.label === 'Negative' ? -signal.score : 0;
  return clamp(signedScore, -1, 1);
}

function estimateEnergy(result: LocalEchoAnalysis) {
  const normalized = result.transcript.toLowerCase();
  const highEnergyLanguage = /(panic|racing|right now|urgent|overwhelmed|can't breathe|spiraling)/.test(normalized);
  const lowEnergyLanguage = /(drained|numb|tired|exhausted|empty|shutdown|shut down)/.test(normalized);

  let energy = 0.45;

  if (result.escalation.urgency === 'same-day') energy += 0.12;
  if (result.escalation.urgency === 'immediate') energy += 0.24;

  if (result.safety.label === 'medium') energy += 0.12;
  if (result.safety.label === 'high') energy += 0.22;

  if (highEnergyLanguage) energy += 0.16;
  if (lowEnergyLanguage) energy -= 0.16;

  return clamp(energy, 0, 1);
}

function estimateConfidence(result: LocalEchoAnalysis) {
  const modelBoost = result.analysisEngine.includes('transformers') ? 0.14 : 0;
  const fallbackPenalty = result.analysisEngineNote ? 0.2 : 0;
  const base = 0.42 + Math.max(result.sentiment.score, result.safety.score) * 0.34 + modelBoost - fallbackPenalty;
  return clamp(base, 0, 1);
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

      setPreviousValence(result ? toValence(result.sentiment) : null);
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

  const valence = result ? toValence(result.sentiment) : 0;
  const energy = result ? estimateEnergy(result) : 0;
  const confidence = result ? estimateConfidence(result) : 0;
  const valencePercent = ((valence + 1) / 2) * 100;
  const previousValencePercent = previousValence === null ? null : ((previousValence + 1) / 2) * 100;
  const energyPercentFromTop = (1 - energy) * 100;
  const quadrantName = result ? formatQuadrantName(valence, energy) : '';
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

          <div className="mt-3" role="img" aria-label={`Sentiment rail showing ${formatValenceTone(valence).toLowerCase()}`} data-testid="sentiment-rail">
            <svg viewBox="0 0 100 20" className="h-6 w-full" aria-hidden="true">
              <defs>
                <linearGradient id="echoSentimentRailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0369a1" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <line x1="1" y1="10" x2="99" y2="10" stroke="url(#echoSentimentRailGradient)" strokeWidth="4" strokeLinecap="round" />
              <line x1="50" y1="4" x2="50" y2="16" stroke="#475569" strokeWidth="1" />
              {previousValencePercent !== null && (
                <circle cx={previousValencePercent} cy="10" r="2.4" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
              )}
              <circle
                cx={valencePercent}
                cy="10"
                r="3"
                fill={confidence < 0.5 ? '#ffffff' : '#c7d2fe'}
                stroke={confidence < 0.5 ? '#64748b' : '#4338ca'}
                strokeWidth="1.4"
              />
            </svg>
            <div className="mt-2 flex justify-between text-xs text-slate-600">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
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
                <div className="rounded bg-amber-50 px-2 py-1">Energized</div>
                <div className="rounded bg-sky-50 px-2 py-1">Overwhelmed</div>
                <div className="rounded bg-emerald-50 px-2 py-1">Grounded</div>
                <div className="rounded bg-slate-100 px-2 py-1">Drained</div>
              </div>
              <div className="mt-3 flex justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="h-44 w-44"
                  role="img"
                  aria-label={`Emotion compass in ${quadrantName.toLowerCase()} zone`}
                >
                  <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="50" y1="2" x2="50" y2="98" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="#e2e8f0" strokeWidth="1" />
                  <circle cx={valencePercent} cy={energyPercentFromTop} r="4" fill="#a5b4fc" stroke="#4338ca" strokeWidth="1.4" />
                </svg>
              </div>
              <div className="mt-2 text-center text-sm text-slate-700">
                Current zone: <span className="font-semibold">{quadrantName}</span>
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
