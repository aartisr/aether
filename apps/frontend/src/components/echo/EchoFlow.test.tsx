import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { VoiceCapture } from '../../lib/local-ai';
import SentimentMapping from './SentimentMapping';
import VoiceRecorder from './VoiceRecorder';

type MockTrack = { stop: jest.Mock };

class MockMediaRecorder {
  static instance: MockMediaRecorder | null = null;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(stream: MediaStream) {
    void stream;
    MockMediaRecorder.instance = this;
  }

  start() {
    return undefined;
  }

  stop() {
    this.ondataavailable?.({ data: new Blob(['audio-bytes'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

class MockSpeechRecognition {
  static instance: MockSpeechRecognition | null = null;
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    MockSpeechRecognition.instance = this;
  }

  start() {
    return undefined;
  }

  stop() {
    return undefined;
  }
}

function EchoFlowHarness() {
  const [capture, setCapture] = useState<VoiceCapture | null>(null);

  return (
    <div>
      <VoiceRecorder onCaptureComplete={setCapture} />
      <SentimentMapping
        audio={capture?.audio ?? null}
        transcript={capture?.transcript ?? ''}
        transcriptSource={capture?.transcriptSource ?? 'unavailable'}
      />
    </div>
  );
}

describe('Echo flow integration', () => {
  const getUserMedia = jest.fn();
  const createObjectURL = jest.fn(() => 'blob:mock-audio');

  beforeEach(() => {
    jest.useFakeTimers();
    getUserMedia.mockReset();
    createObjectURL.mockClear();
    MockSpeechRecognition.instance = null;
    MockMediaRecorder.instance = null;

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia },
      configurable: true,
    });
    Object.defineProperty(global, 'MediaRecorder', {
      value: MockMediaRecorder,
      configurable: true,
    });
    Object.defineProperty(global.URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });

    Object.defineProperty(window, 'SpeechRecognition', {
      value: MockSpeechRecognition,
      configurable: true,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('propagates transcript on stop and enables Analyze with ready status', async () => {
    const track: MockTrack = { stop: jest.fn() };
    const stream = { getTracks: () => [track] } as unknown as MediaStream;
    getUserMedia.mockResolvedValue(stream);

    render(<EchoFlowHarness />);

    const analyzeButton = screen.getByRole('button', { name: /analyze check-in/i });
    expect(analyzeButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });

    act(() => {
      MockSpeechRecognition.instance?.onresult?.({
        results: [{ 0: { transcript: 'I feel steady today' } }],
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      expect(track.stop).toHaveBeenCalledTimes(1);
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/transcript ready. you can analyze this check-in./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze check-in/i })).toBeEnabled();
    });
  });
});