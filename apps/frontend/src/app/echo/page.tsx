"use client";

import React from 'react';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import type { VoiceCapture } from '../../lib/local-ai';

const VoiceRecorder = dynamic(() => import('../../components/echo/VoiceRecorder'), { ssr: false });
const SentimentMapping = dynamic(() => import('../../components/echo/SentimentMapping'), { ssr: false });

export default function EchoChamber() {
  const [capture, setCapture] = useState<VoiceCapture | null>(null);
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-700">Echo Chamber</h1>
        <p className="text-lg text-gray-600">An anonymized, voice-enabled outlet for catharsis. Speak your thoughts freely and review a private, on-device transcript with local sentiment and safety signals.</p>
        <div className="mt-8">
          <VoiceRecorder
            onRecordingComplete={(audio) => {
              setCapture((current) => ({
                audio,
                transcript: current?.transcript || '',
                transcriptSource: current?.transcriptSource || 'unavailable',
              }));
            }}
            onCaptureComplete={setCapture}
          />
          <SentimentMapping audio={capture?.audio ?? null} transcript={capture?.transcript ?? ''} />
        </div>
        <p className="text-xs text-gray-400 mt-4">Your privacy is protected. Audio, transcript, and classification remain on-device in this implementation.</p>
      </div>
    </section>
  );
}
