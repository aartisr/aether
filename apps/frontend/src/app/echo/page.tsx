"use client";

import React from 'react';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { TranscriptSource, VoiceCapture } from '../../lib/local-ai';
import { PageBackdrop, PageContainer, PageHero, SurfaceCard } from '../../components/page/PagePrimitives';

const VoiceRecorder = dynamic(() => import('../../components/echo/VoiceRecorder'), {
  ssr: false,
  loading: () => <p className="text-sm text-slate-500">Loading recorder...</p>,
});
const SentimentMapping = dynamic(() => import('../../components/echo/SentimentMapping'), {
  ssr: false,
  loading: () => <p className="mt-3 text-sm text-slate-500">Preparing local sentiment analysis...</p>,
});

export default function EchoChamber() {
  const [entryMode, setEntryMode] = useState<'voice' | 'write'>('voice');
  const [capture, setCapture] = useState<VoiceCapture | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranscriptSource, setLiveTranscriptSource] = useState<TranscriptSource>('unavailable');

  const handleCaptureComplete = (nextCapture: VoiceCapture) => {
    setCapture(nextCapture);
    setLiveTranscript(nextCapture.transcript);
    setLiveTranscriptSource(nextCapture.transcriptSource);
  };

  const handleTranscriptChange = (nextTranscript: string, nextSource: TranscriptSource) => {
    setLiveTranscript(nextTranscript);
    setLiveTranscriptSource(nextSource);
  };

  return (
    <PageBackdrop>
      <PageContainer className="max-w-3xl">
        <PageHero
          kicker="Private Reflection"
          title="Echo Chamber"
          description="A quiet place to name what is happening and leave with one gentler next step."
        />
        <SurfaceCard className="border-emerald-200 bg-emerald-50/70">
          <p className="theme-kicker">Start here</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">How would you like to reflect?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">There is no right way. Choose the one that feels easiest right now.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setEntryMode('voice')}
              className={`rounded-2xl border p-4 text-left transition ${entryMode === 'voice' ? 'border-emerald-700 bg-emerald-800 text-white shadow-md' : 'border-emerald-200 bg-white text-slate-900 hover:border-emerald-400'}`}
            >
              <span className="block text-sm font-black">Speak out loud</span>
              <span className={`mt-1 block text-xs leading-5 ${entryMode === 'voice' ? 'text-emerald-50' : 'text-slate-600'}`}>Record privately, then review your words.</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('write')}
              className={`rounded-2xl border p-4 text-left transition ${entryMode === 'write' ? 'border-emerald-700 bg-emerald-800 text-white shadow-md' : 'border-emerald-200 bg-white text-slate-900 hover:border-emerald-400'}`}
            >
              <span className="block text-sm font-black">Write a few words</span>
              <span className={`mt-1 block text-xs leading-5 ${entryMode === 'write' ? 'text-emerald-50' : 'text-slate-600'}`}>A sentence is enough to begin.</span>
            </button>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-600">
            Privacy-first: recordings, transcription, and analysis stay in this browser. Echo never sends your voice or reflection to a server.
          </p>
        </SurfaceCard>
        {entryMode === 'voice' ? (
          <SurfaceCard>
            <p className="theme-kicker">Step 1 · Speak</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Say only what you are ready to say.</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">You can stop at any time, edit the transcript, or switch to writing.</p>
            <div className="mt-5">
              <VoiceRecorder
                onCaptureComplete={handleCaptureComplete}
                onTranscriptChange={handleTranscriptChange}
              />
            </div>
            {liveTranscript.trim() ? (
              <SentimentMapping
                audio={capture?.audio ?? null}
                transcript={liveTranscript}
                transcriptSource={liveTranscriptSource}
                showTranscriptEditor={false}
                showReadyPrompt={false}
                title="Notice a pattern in your reflection"
                description="Treat this as a gentle prompt, not a verdict about you."
                analyzeLabel="Notice a pattern"
              />
            ) : null}
          </SurfaceCard>
        ) : (
          <SurfaceCard>
            <SentimentMapping
              audio={null}
              showReadyPrompt={false}
              title="Put a few words somewhere safe"
              description="Write naturally. Nothing is saved or sent from this page."
              analyzeLabel="Notice a pattern"
            />
          </SurfaceCard>
        )}
      </PageContainer>
    </PageBackdrop>
  );
}
