"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { TranscriptSource, VoiceCapture } from '../../lib/local-ai';

// ─── Error message helpers ────────────────────────────────────────────────────

function getMicrophoneErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return "Microphone access was denied. Click the lock icon in your browser's address bar, choose 'Allow' for microphone, then try again.";
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No microphone was found. Please connect a microphone to your device and try again.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Your microphone is in use by another app. Close any other apps using the microphone (e.g. video call apps) and try again.';
      case 'OverconstrainedError':
        return "Your microphone doesn't support the required audio format. Try a different microphone.";
      case 'AbortError':
        return 'Microphone access was interrupted. Please try again.';
      case 'SecurityError':
        return "Microphone access is blocked by your browser's security settings. Make sure this page is on a secure (HTTPS) connection.";
      default:
        break;
    }
  }
  return 'Could not access the microphone. Check your browser permissions and try again.';
}

/**
 * Returns a user-facing notice for a SpeechRecognition error, or null when the
 * error is benign (silence / programmatic stop) and should be silently ignored.
 */
function getSpeechRecognitionNotice(errorCode: string): string | null {
  switch (errorCode) {
    case 'no-speech':
    case 'aborted':
      return null;
    case 'audio-capture':
      return 'Microphone stopped responding during transcription. Recording continues — you can type notes below.';
    case 'network':
      return 'Live transcription requires a network connection in this browser. Recording continues — you can type notes below.';
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission was revoked mid-session. Recording continues but live transcription is paused.';
    default:
      return 'Live transcription stopped unexpectedly. Recording continues — you can type notes below.';
  }
}

function getBestMimeType(): string {
  try {
    if (typeof MediaRecorder?.isTypeSupported === 'function') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
      if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/ogg')) return 'audio/ogg';
    }
  } catch {
    // Fall through — browser will choose the best available codec
  }
  return '';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type LiveStatus = 'idle' | 'active' | 'unavailable';

export default function VoiceRecorder({
  onRecordingComplete,
  onCaptureComplete,
  recordButtonLabel = 'Start Recording',
  stopButtonLabel = 'Stop Recording',
  className = '',
}: {
  onRecordingComplete?: (audio: Blob) => void;
  onCaptureComplete?: (capture: VoiceCapture) => void;
  recordButtonLabel?: string;
  stopButtonLabel?: string;
  className?: string;
}) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionNotice, setTranscriptionNotice] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle');

  /**
   * Refs are the synchronous source of truth for async callbacks.
   * React state is only for rendering — never read from state inside a callback.
   */
  const isRecordingRef = useRef(false);
  // Always mirrors the `transcript` state synchronously; read by onstop callback
  const transcriptRef = useRef('');
  const transcriptSourceRef = useRef<TranscriptSource>('unavailable');
  // Tracks cumulative isFinal text from SpeechRecognition so we can compute deltas
  const recognitionFinalRef = useRef('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount (prevent timer and mic stream leaks)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    const current = recognitionRef.current;
    // Null out BEFORE calling stop() so that the onend handler won't restart it
    recognitionRef.current = null;
    if (current) {
      try { current.stop(); } catch { /* ignore stop races */ }
    }
  }, []);

  const startSpeechRecognition = useCallback(() => {
    const Ctor =
      typeof window !== 'undefined'
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
        : undefined;

    if (!Ctor) {
      setLiveStatus('unavailable');
      setTranscriptionNotice(
        'Live transcription is not available in this browser (try Chrome or Edge). ' +
        'Recording continues — you can type notes in the text pad below.',
      );
      return;
    }

    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let allFinal = '';
      let currentInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i] as SpeechRecognitionResult;
        if (result.isFinal) {
          allFinal += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      // Only append the NEW delta so prior user edits in the textarea are preserved
      if (allFinal.length > recognitionFinalRef.current.length) {
        const delta = allFinal.slice(recognitionFinalRef.current.length).trim();
        if (delta) {
          const base = transcriptRef.current;
          const next = base ? `${base.trimEnd()} ${delta}` : delta;
          // Update ref SYNCHRONOUSLY first — onstop reads this, not React state
          transcriptRef.current = next;
          transcriptSourceRef.current = 'speech-recognition';
          setTranscript(next);
          recognitionFinalRef.current = allFinal;
        }
      }

      setInterimText(currentInterim.trim());
      setLiveStatus('active');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const notice = getSpeechRecognitionNotice(event.error);
      if (notice !== null) {
        setTranscriptionNotice(notice);
        setLiveStatus('unavailable');
      }
      // 'no-speech' / 'aborted' return null → silently ignored
    };

    recognition.onend = () => {
      setInterimText('');
      // Auto-restart to survive Chrome's ~3 s silence timeout.
      // recognitionRef.current is set to null by stopSpeechRecognition BEFORE
      // stop() is called, so this guard reliably prevents restarts post-recording.
      if (isRecordingRef.current && recognitionRef.current === recognition) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setLiveStatus('active');
    } catch {
      setLiveStatus('unavailable');
      setTranscriptionNotice(
        'Could not start live transcription. Recording continues — you can type notes below.',
      );
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    setTranscriptionNotice(null);
    setAudioURL(null);
    setElapsed(0);
    setTranscript('');
    setInterimText('');
    setLiveStatus('idle');
    transcriptRef.current = '';
    transcriptSourceRef.current = 'unavailable';
    recognitionFinalRef.current = '';

    // Guard: getUserMedia requires HTTPS (or localhost) and a supported browser
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Microphone access is not available on this page. ' +
        'Make sure you are on a secure (HTTPS) connection, refresh the page, and allow microphone permission.',
      );
      return;
    }

    // Guard: MediaRecorder is not present in all browsers (e.g. older Safari)
    if (typeof window.MediaRecorder === 'undefined') {
      setError(
        'Audio recording is not supported in this browser. ' +
        'Please use the latest version of Chrome, Edge, or Firefox and try again.',
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getBestMimeType();
      const mediaRecorder = mimeType
        ? new window.MediaRecorder(stream, { mimeType })
        : new window.MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const effectiveMime = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: effectiveMime });
        setAudioURL(URL.createObjectURL(blob));
        onRecordingComplete?.(blob);
        onCaptureComplete?.({
          audio: blob,
          // Read from ref (always synchronous/current) — never stale
          transcript: transcriptRef.current,
          transcriptSource: transcriptSourceRef.current,
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      isRecordingRef.current = true;
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      startSpeechRecognition();
    } catch (err) {
      setError(getMicrophoneErrorMessage(err));
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !recording) return;
    // Set ref to false BEFORE stop() so onend won't trigger a restart
    isRecordingRef.current = false;
    stopSpeechRecognition();
    setInterimText('');
    setLiveStatus('idle');
    mediaRecorderRef.current.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Update ref synchronously so capture callback always has the latest text
    transcriptRef.current = value;
    transcriptSourceRef.current = value ? 'manual' : 'unavailable';
    setTranscript(value);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>

      {/* ── Controls ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`rounded-lg px-6 py-3 font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
            recording
              ? 'animate-pulse bg-rose-700 text-white hover:bg-rose-800'
              : 'bg-emerald-800 text-white hover:bg-emerald-900'
          }`}
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? stopButtonLabel : recordButtonLabel}
        >
          {recording ? stopButtonLabel : recordButtonLabel}
        </button>

        {recording && (
          <span className="flex items-center gap-2 text-sm text-slate-600" aria-live="polite">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden="true" />
            <span>{formatTime(elapsed)}</span>
            {liveStatus === 'active' && (
              <span className="text-xs font-medium text-emerald-700">● live transcription</span>
            )}
          </span>
        )}
      </div>

      {/* ── Transcription / permission notice ── */}
      {transcriptionNotice && (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
          role="status"
          aria-live="polite"
        >
          {transcriptionNotice}
        </p>
      )}

      {/* ── Text pad — visible once recording starts or a transcript exists ── */}
      {(recording || transcript) && (
        <div className="w-full">
          <label
            htmlFor="voice-transcript-pad"
            className="mb-1 block text-xs font-black uppercase tracking-[0.08em] text-emerald-800"
          >
            Transcript{recording && liveStatus === 'active' ? ' (live)' : ''}
          </label>
          <textarea
            id="voice-transcript-pad"
            className="min-h-[96px] w-full resize-none rounded-lg border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            rows={5}
            value={transcript}
            onChange={handleTranscriptChange}
            placeholder={
              recording
                ? 'Speak now — words will appear here in real time…'
                : 'No transcript captured. You can type notes here.'
            }
            aria-label="Voice transcript"
          />
          {interimText && (
            <p className="mt-1 text-xs italic text-slate-500" aria-live="polite">
              <span className="font-semibold not-italic text-emerald-700">Hearing:</span>{' '}
              {interimText}
            </p>
          )}
        </div>
      )}

      {/* ── Playback ── */}
      {audioURL && (
        <div className="w-full">
          <p className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-slate-700">Playback</p>
          <audio
            controls
            src={audioURL}
            className="w-full"
            aria-label="Playback recorded audio"
          />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <p className="mt-1 text-center text-xs text-slate-500">
        Your voice is never sent to a server. All processing happens locally on your device.
      </p>
    </div>
  );
}

// ─── Web Speech API type declarations ─────────────────────────────────────────
// Scoped to this file; extends the minimal built-in types for continuous recognition.
declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition };
    webkitSpeechRecognition?: { new (): SpeechRecognition };
  }

  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
}
