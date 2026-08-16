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

  const quickFlow = [
    {
      title: 'Record',
      detail: 'Speak freely for a short moment to release pressure.',
    },
    {
      title: 'Review',
      detail: 'Check transcript and sentiment cues for patterns, not judgment.',
    },
    {
      title: 'Respond',
      detail: 'Use the signal to choose one calmer next step.',
    },
  ];

  return (
    <PageBackdrop>
      <PageContainer className="max-w-3xl">
        <PageHero
          kicker="Private Reflection"
          title="Echo Chamber"
          description="A private space to put thoughts into words, notice patterns, and choose one calmer next step."
        />
        <SurfaceCard className="border-emerald-200 bg-emerald-50/70">
          <p className="theme-kicker">Privacy promise</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Your voice stays on your device.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Echo records, transcribes, and analyzes only in this browser. Live dictation starts only when the browser confirms on-device processing; Echo never switches to cloud speech recognition. Your browser may need a one-time language-pack download before private dictation is available.
          </p>
        </SurfaceCard>
        <SurfaceCard className="border-emerald-100 bg-emerald-50/50">
          <p className="theme-kicker">Quick flow</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {quickFlow.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-emerald-200 bg-white p-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-emerald-800">Step {index + 1}</p>
                <h2 className="mt-1 text-base font-black text-slate-950">{step.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-700">{step.detail}</p>
              </article>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <VoiceRecorder
            onCaptureComplete={handleCaptureComplete}
            onTranscriptChange={handleTranscriptChange}
          />
          <SentimentMapping
            audio={capture?.audio ?? null}
            transcript={liveTranscript}
            transcriptSource={liveTranscriptSource}
          />
          <p className="mt-4 text-xs leading-6 text-slate-600">
            Privacy-first by design: recording, dictation, and text analysis stay in this browser. On-device dictation may need a one-time local language-pack download; Echo never falls back to cloud speech recognition.
          </p>
          {!capture ? (
            <p className="mt-2 text-xs leading-6 text-slate-500">
              If your microphone is blocked, enable browser microphone permissions and refresh this page.
            </p>
          ) : null}
        </SurfaceCard>
      </PageContainer>
    </PageBackdrop>
  );
}
