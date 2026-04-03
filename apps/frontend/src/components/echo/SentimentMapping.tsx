"use client";
import React, { useState } from 'react';

import { analyzeLocalEchoTranscript, type LocalEchoAnalysis } from '../../lib/local-ai';

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
  analyzeLabel = 'Analyze Check-In',
  className = '',
  analyzeSentiment = defaultAnalyzeSentiment,
}: {
  audio: Blob | null;
  transcript?: string;
  analyzeLabel?: string;
  className?: string;
  analyzeSentiment?: (input: { audio: Blob | null; transcript: string }) => Promise<LocalEchoAnalysis>;
}) {
  const [editableTranscript, setEditableTranscript] = useState(transcript);
  const [result, setResult] = useState<LocalEchoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setEditableTranscript(transcript);
  }, [transcript]);

  const handleAnalyze = async () => {
    if (!editableTranscript.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await analyzeSentiment({ audio, transcript: editableTranscript });
    setResult(res);
    setLoading(false);
  };

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
        disabled={!editableTranscript.trim() || loading}
        aria-label={analyzeLabel}
      >
        {loading ? (
          <span className="animate-pulse">Analyzing...</span>
        ) : (
          analyzeLabel
        )}
      </button>
      {result && (
        <div className="mt-2 w-full max-w-xl rounded-xl border border-indigo-100 bg-white p-4 shadow-sm" aria-live="polite">
          <div className="text-lg font-semibold text-indigo-700">
            Sentiment: <span>{result.sentiment.label}</span> ({result.sentiment.score.toFixed(2)})
          </div>
          <div className="mt-2 text-sm text-slate-700">
            Safety signal: <span className="font-semibold uppercase">{result.safety.label}</span> ({result.safety.score.toFixed(2)})
          </div>
          <div className="mt-2 text-sm text-slate-700">
            Escalation urgency: <span className="font-semibold uppercase">{result.escalation.urgency}</span>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Matched terms: {[...result.sentiment.matchedTerms, ...result.safety.matchedTerms].join(', ') || 'None'}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Engine: {result.analysisEngine}
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
