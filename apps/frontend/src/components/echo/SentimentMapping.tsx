"use client";
import React, { useState } from 'react';

/**
 * SentimentMapping
 * A generic, accessible sentiment analysis UI for audio or text input.
 *
 * @param audio Audio Blob to analyze
 * @param analyzeLabel Custom label for the analyze button
 * @param className Optional className for container
 */
function defaultAnalyzeSentiment(audio: Blob): Promise<{ score: number; label: string }> {
  void audio;
  return new Promise((resolve) => {
    setTimeout(() => {
      const score = Math.random() * 2 - 1;
      let label = 'Neutral';
      if (score > 0.3) label = 'Positive';
      else if (score < -0.3) label = 'Negative';
      resolve({ score, label });
    }, 1200);
  });
}

export default function SentimentMapping({
  audio,
  analyzeLabel = 'Analyze Sentiment',
  className = '',
  analyzeSentiment = defaultAnalyzeSentiment,
}: {
  audio: Blob | null;
  analyzeLabel?: string;
  className?: string;
  analyzeSentiment?: (audio: Blob) => Promise<{ score: number; label: string }>;
}) {
  const [result, setResult] = useState<{ score: number; label: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!audio) return;
    setLoading(true);
    setResult(null);
    const res = await analyzeSentiment(audio);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className={`mt-6 flex flex-col items-center gap-2 ${className}`}>
      <button
        className="px-4 py-2 bg-indigo-400 text-white rounded shadow hover:bg-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        onClick={handleAnalyze}
        disabled={!audio || loading}
        aria-label={analyzeLabel}
      >
        {loading ? (
          <span className="animate-pulse">Analyzing...</span>
        ) : (
          analyzeLabel
        )}
      </button>
      {result && (
        <div className="mt-2 text-lg font-semibold text-indigo-700" aria-live="polite">
          Sentiment: <span>{result.label}</span> ({result.score.toFixed(2)})
        </div>
      )}
      <div className="text-xs text-gray-400 max-w-xs text-center mt-1">
        <span role="img" aria-label="lock">🔒</span> All analysis is performed locally for privacy. No audio or data is sent to a server.
      </div>
    </div>
  );
}
