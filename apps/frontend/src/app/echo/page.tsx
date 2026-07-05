"use client";

import React from 'react';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { VoiceCapture } from '../../lib/local-ai';
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
          description="An anonymized, voice-enabled outlet for catharsis with on-device transcript, sentiment, and safety signal mapping."
        />
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
          <VoiceRecorder onCaptureComplete={setCapture} />
          <SentimentMapping
            audio={capture?.audio ?? null}
            transcript={capture?.transcript ?? ''}
            transcriptSource={capture?.transcriptSource ?? 'unavailable'}
          />
          <p className="mt-4 text-xs leading-6 text-slate-600">
            Audio, transcript, and classifications remain on-device in this implementation.
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
