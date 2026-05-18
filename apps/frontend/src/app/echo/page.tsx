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
  return (
    <PageBackdrop>
      <PageContainer className="max-w-3xl">
        <PageHero
          kicker="Private Reflection"
          title="Echo Chamber"
          description="An anonymized, voice-enabled outlet for catharsis with on-device transcript, sentiment, and safety signal mapping."
        />
        <SurfaceCard>
          <VoiceRecorder onCaptureComplete={setCapture} />
          <SentimentMapping
            audio={capture?.audio ?? null}
            transcript={capture?.transcript ?? ''}
            transcriptSource={capture?.transcriptSource ?? 'unavailable'}
          />
          <p className="mt-4 text-xs text-slate-500">
            Audio, transcript, and classifications remain on-device in this implementation.
          </p>
        </SurfaceCard>
      </PageContainer>
    </PageBackdrop>
  );
}
