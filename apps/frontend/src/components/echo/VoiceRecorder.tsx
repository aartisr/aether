"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { prepareBrowserTranscription, transcribeAudioInBrowser } from '../../lib/browser-transcription';
import { createRollingCaptionSession, type RollingCaptionSession } from '../../lib/rolling-browser-transcription';
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
      return 'Live dictation could not reach this browser\'s speech-recognition service. Your recording stays in this browser; you can reconnect, try Chrome or Edge, or type notes below.';
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

const RECOGNITION_PERMISSION_GRACE_MS = 2500;
const RECOGNITION_RETRY_DELAY_MS = 900;
const RECOGNITION_MAX_STARTUP_RETRIES = 2;
const LOCAL_RECOGNITION_LANGUAGE = 'en-US';
const ROLLING_CAPTION_SLICE_MS = 5000;
const LIVE_CAPTIONS_UNAVAILABLE_NOTICE =
  'This browser can record privately, but can’t show words as you speak. Finish your recording, then choose Transcribe privately on this device.';

function isStartupPermissionHandshake(errorCode: string, startedAt: number, hasTranscript: boolean): boolean {
  return (
    (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') &&
    !hasTranscript &&
    startedAt > 0 &&
    Date.now() - startedAt <= RECOGNITION_PERMISSION_GRACE_MS
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type LiveStatus = 'idle' | 'active' | 'unavailable';

export default function VoiceRecorder({
  onRecordingComplete,
  onCaptureComplete,
  onTranscriptChange,
  recordButtonLabel = 'Start Recording',
  stopButtonLabel = 'Stop Recording',
  className = '',
}: {
  onRecordingComplete?: (audio: Blob) => void;
  onCaptureComplete?: (capture: VoiceCapture) => void;
  onTranscriptChange?: (transcript: string, transcriptSource: TranscriptSource) => void;
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
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isLocalTranscribing, setIsLocalTranscribing] = useState(false);
  const [localTranscriptionDetail, setLocalTranscriptionDetail] = useState<string | null>(null);
  const [localTranscriptionError, setLocalTranscriptionError] = useState<string | null>(null);
  const [rollingCaptionsEnabled, setRollingCaptionsEnabled] = useState(false);
  const [preparingRollingCaptions, setPreparingRollingCaptions] = useState(false);
  const [rollingCaptionNotice, setRollingCaptionNotice] = useState<string | null>(null);

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
  const recognitionStartedAtRef = useRef(0);
  const recognitionStartupRetryCountRef = useRef(0);
  const recognitionRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionStartAttemptRef = useRef(0);
  const onTranscriptChangeRef = useRef(onTranscriptChange);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rollingSessionRef = useRef<RollingCaptionSession | null>(null);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  // Cleanup on unmount (prevent timer and mic stream leaks)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRetryTimeoutRef.current) clearTimeout(recognitionRetryTimeoutRef.current);
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioURL && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const stopSpeechRecognition = useCallback(() => {
    recognitionStartAttemptRef.current += 1;
    const current = recognitionRef.current;
    // Null out BEFORE calling stop() so that the onend handler won't restart it
    recognitionRef.current = null;
    recognitionStartedAtRef.current = 0;
    recognitionStartupRetryCountRef.current = 0;
    if (recognitionRetryTimeoutRef.current) {
      clearTimeout(recognitionRetryTimeoutRef.current);
      recognitionRetryTimeoutRef.current = null;
    }
    if (current) {
      try { current.stop(); } catch { /* ignore stop races */ }
    }
  }, []);

  const startSpeechRecognition = useCallback(async () => {
    const Ctor =
      typeof window !== 'undefined'
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
        : undefined;

    if (!Ctor) {
      setLiveStatus('unavailable');
      setTranscriptionNotice(LIVE_CAPTIONS_UNAVAILABLE_NOTICE);
      return;
    }

    // Web Speech defaults to server-backed recognition in many browsers. Echo is
    // deliberately local-only: never allow an implicit cloud fallback.
    if (typeof Ctor.available !== 'function' || typeof Ctor.install !== 'function') {
      setLiveStatus('unavailable');
      setTranscriptionNotice(LIVE_CAPTIONS_UNAVAILABLE_NOTICE);
      return;
    }

    const attempt = ++recognitionStartAttemptRef.current;
    setTranscriptionNotice('Preparing private live captions…');

    let availability: SpeechRecognitionAvailability;
    try {
      availability = await Ctor.available({
        langs: [LOCAL_RECOGNITION_LANGUAGE],
        processLocally: true,
        quality: 'dictation',
      });
    } catch {
      setLiveStatus('unavailable');
      setTranscriptionNotice(LIVE_CAPTIONS_UNAVAILABLE_NOTICE);
      return;
    }

    if (!isRecordingRef.current || recognitionStartAttemptRef.current !== attempt) {
      return;
    }

    if (availability === 'downloadable') {
      setTranscriptionNotice('Preparing private live captions for the first time…');
      try {
        const installed = await Ctor.install({
          langs: [LOCAL_RECOGNITION_LANGUAGE],
          processLocally: true,
          quality: 'dictation',
        });
        if (!installed) {
          throw new Error('Language pack installation failed.');
        }
      } catch {
        setLiveStatus('unavailable');
        setTranscriptionNotice(LIVE_CAPTIONS_UNAVAILABLE_NOTICE);
        return;
      }

      if (!isRecordingRef.current || recognitionStartAttemptRef.current !== attempt) {
        return;
      }
    } else if (availability === 'downloading') {
      setLiveStatus('idle');
      setTranscriptionNotice('Private live captions are still preparing. You can keep recording, then use “Transcribe privately on this device” when you finish.');
      return;
    } else if (availability !== 'available') {
      setLiveStatus('unavailable');
      setTranscriptionNotice(LIVE_CAPTIONS_UNAVAILABLE_NOTICE);
      return;
    }

    if (!isRecordingRef.current || recognitionStartAttemptRef.current !== attempt) {
      return;
    }

    setTranscriptionNotice(null);
    const recognition = new Ctor();
    recognition.lang = LOCAL_RECOGNITION_LANGUAGE;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.processLocally = true;

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
          onTranscriptChangeRef.current?.(next, 'speech-recognition');
          recognitionFinalRef.current = allFinal;
        }
      }

      setInterimText(currentInterim.trim());
      setTranscriptionNotice(null);
      setLiveStatus('active');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const hasTranscript = Boolean(transcriptRef.current.trim() || recognitionFinalRef.current.trim());
      if (
        isStartupPermissionHandshake(event.error, recognitionStartedAtRef.current, hasTranscript) &&
        recognitionStartupRetryCountRef.current < RECOGNITION_MAX_STARTUP_RETRIES
      ) {
        setTranscriptionNotice(
          'Finishing microphone permission setup. If you just tapped Allow, live transcription should begin in a moment. Recording continues and you can type below anytime.',
        );
        setLiveStatus('idle');
        if (recognitionRetryTimeoutRef.current) clearTimeout(recognitionRetryTimeoutRef.current);
        recognitionRetryTimeoutRef.current = setTimeout(() => {
          recognitionRetryTimeoutRef.current = null;
          if (!isRecordingRef.current || recognitionRef.current !== recognition) return;
          recognitionStartupRetryCountRef.current += 1;
          recognitionStartedAtRef.current = Date.now();
          try {
            recognition.start();
          } catch {
            // Ignore transient invalid-state races; onend will attempt recovery too.
          }
        }, RECOGNITION_RETRY_DELAY_MS);
        return;
      }

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
      if (
        isRecordingRef.current &&
        recognitionRef.current === recognition &&
        !recognitionRetryTimeoutRef.current
      ) {
        recognitionStartedAtRef.current = Date.now();
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognitionStartedAtRef.current = Date.now();
      recognition.start();
      setLiveStatus('active');
    } catch {
      setLiveStatus('unavailable');
      setTranscriptionNotice(LIVE_CAPTIONS_UNAVAILABLE_NOTICE);
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    setTranscriptionNotice(null);
    setAudioURL(null);
    setRecordedAudio(null);
    setIsLocalTranscribing(false);
    setLocalTranscriptionDetail(null);
    setLocalTranscriptionError(null);
    setElapsed(0);
    setTranscript('');
    setInterimText('');
    setLiveStatus('idle');
    transcriptRef.current = '';
    transcriptSourceRef.current = 'unavailable';
    recognitionFinalRef.current = '';
    recognitionStartedAtRef.current = 0;
    recognitionStartupRetryCountRef.current = 0;
    if (recognitionRetryTimeoutRef.current) {
      clearTimeout(recognitionRetryTimeoutRef.current);
      recognitionRetryTimeoutRef.current = null;
    }
    onTranscriptChangeRef.current?.('', 'unavailable');
    rollingSessionRef.current?.reset();

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
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          if (rollingCaptionsEnabled && isRecordingRef.current && transcriptSourceRef.current !== 'speech-recognition') {
            rollingSessionRef.current?.addAudioChunk(e.data);
          }
        }
      };

      mediaRecorder.onstop = () => {
        const effectiveMime = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: effectiveMime });
        setAudioURL(URL.createObjectURL(blob));
        setRecordedAudio(blob);
        onRecordingComplete?.(blob);
        onCaptureComplete?.({
          audio: blob,
          // Read from ref (always synchronous/current) — never stale
          transcript: transcriptRef.current,
          transcriptSource: transcriptSourceRef.current,
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      isRecordingRef.current = true;
      mediaRecorder.start(rollingCaptionsEnabled ? ROLLING_CAPTION_SLICE_MS : undefined);
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      startSpeechRecognition();
    } catch (err) {
      setError(getMicrophoneErrorMessage(err));
    }
  };

  const enableRollingCaptions = async () => {
    if (preparingRollingCaptions || recording) return;
    setPreparingRollingCaptions(true);
    setRollingCaptionNotice('Preparing private captions for the first time…');
    try {
      await prepareBrowserTranscription((progress) => setRollingCaptionNotice(progress.detail));
      rollingSessionRef.current = createRollingCaptionSession({
        onTranscript: (nextTranscript) => {
          transcriptRef.current = nextTranscript;
          transcriptSourceRef.current = 'on-device-model';
          setTranscript(nextTranscript);
          onTranscriptChangeRef.current?.(nextTranscript, 'on-device-model');
        },
        onStatus: setRollingCaptionNotice,
      });
      setRollingCaptionsEnabled(true);
      setRollingCaptionNotice('Private rolling captions are ready. They may appear a few seconds after you speak.');
    } catch {
      setRollingCaptionNotice('Private rolling captions could not be prepared. You can still record and transcribe when you finish.');
    } finally {
      setPreparingRollingCaptions(false);
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
    onTranscriptChangeRef.current?.(value, value ? 'manual' : 'unavailable');
  };

  const transcribeRecordedAudioLocally = async () => {
    if (!recordedAudio || isLocalTranscribing) return;

    setIsLocalTranscribing(true);
    setLocalTranscriptionError(null);
    setLocalTranscriptionDetail('Preparing private on-device transcription…');

    try {
      const nextTranscript = await transcribeAudioInBrowser(recordedAudio, (progress) => {
        setLocalTranscriptionDetail(progress.detail);
      });
      transcriptRef.current = nextTranscript;
      transcriptSourceRef.current = 'on-device-model';
      setTranscript(nextTranscript);
      onTranscriptChangeRef.current?.(nextTranscript, 'on-device-model');
      setLocalTranscriptionDetail('Private transcription is ready. Review it before analysis.');
    } catch {
      setLocalTranscriptionDetail(null);
      setLocalTranscriptionError(
        'Private transcription could not start in this browser. Your recording remains here; you can try again or type notes below.',
      );
    } finally {
      setIsLocalTranscribing(false);
    }
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

      {!recording && !rollingCaptionsEnabled ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-bold text-slate-900">Want captions while you speak?</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Optional for desktop: downloads and caches a private model in this browser. Captions arrive with a short delay and may use more battery.</p>
          <button type="button" onClick={() => void enableRollingCaptions()} disabled={preparingRollingCaptions} className="mt-3 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-emerald-900 disabled:opacity-60">
            {preparingRollingCaptions ? 'Preparing private captions…' : 'Enable private rolling captions'}
          </button>
        </div>
      ) : null}
      {rollingCaptionNotice ? <p className="text-xs text-slate-600" aria-live="polite">{rollingCaptionNotice}</p> : null}

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
          {!transcript.trim() ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-bold text-emerald-950">Turn this recording into text, privately</p>
              <p className="mt-1 text-xs leading-5 text-emerald-900">
                The first use downloads a small English language model from Hugging Face, then keeps it in this browser. Hugging Face sees that download request; your recording and words never leave your device.
              </p>
              <button
                type="button"
                onClick={() => void transcribeRecordedAudioLocally()}
                disabled={isLocalTranscribing}
                className="mt-3 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
              >
                {isLocalTranscribing ? 'Preparing private transcription…' : 'Transcribe privately on this device'}
              </button>
              {localTranscriptionDetail ? (
                <p className="mt-2 text-xs font-medium text-emerald-800" aria-live="polite">{localTranscriptionDetail}</p>
              ) : null}
              {localTranscriptionError ? (
                <p className="mt-2 text-xs font-medium text-rose-700" role="status">{localTranscriptionError}</p>
              ) : null}
            </div>
          ) : null}
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
        Your recording, words, and reflection stay in this browser. Nothing is sent to Aether.
      </p>
    </div>
  );
}

// ─── Web Speech API type declarations ─────────────────────────────────────────
// Scoped to this file; extends the minimal built-in types for continuous recognition.
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }

  type SpeechRecognitionAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

  type SpeechRecognitionConstructor = {
    new (): SpeechRecognition;
    available?: (options: SpeechRecognitionLanguagePackOptions) => Promise<SpeechRecognitionAvailability>;
    install?: (options: SpeechRecognitionLanguagePackOptions) => Promise<boolean>;
  };

  type SpeechRecognitionLanguagePackOptions = {
    langs: string[];
    processLocally: boolean;
    quality?: 'dictation';
  };

  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    processLocally: boolean;
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
