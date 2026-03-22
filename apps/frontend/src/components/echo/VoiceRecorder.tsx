"use client";
import React, { useRef, useState } from 'react';

/**
 * VoiceRecorder
 * A generic, accessible, and privacy-first audio recorder React component.
 *
 * @param onRecordingComplete Callback when recording is finished (audio Blob)
 * @param recordButtonLabel Custom label for the record button
 * @param stopButtonLabel Custom label for the stop button
 * @param className Optional className for container
 */
export default function VoiceRecorder({
  onRecordingComplete,
  recordButtonLabel = 'Start Recording',
  stopButtonLabel = 'Stop Recording',
  className = '',
}: {
  onRecordingComplete?: (audio: Blob) => void;
  recordButtonLabel?: string;
  stopButtonLabel?: string;
  className?: string;
}) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Utility to format time as mm:ss
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const startRecording = async () => {
    setError(null);
    setAudioURL(null);
    setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        if (onRecordingComplete) onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } catch (err) {
      setError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          className={`px-6 py-3 rounded-lg font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${recording ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? stopButtonLabel : recordButtonLabel}
        >
          {recording ? stopButtonLabel : recordButtonLabel}
        </button>
        <span className="text-gray-500 text-sm" aria-live="polite">{recording ? formatTime(elapsed) : ''}</span>
      </div>
      {audioURL && (
        <audio controls src={audioURL} className="w-full mt-2" aria-label="Playback recorded audio" />
      )}
      {error && <div className="text-red-500 text-sm" role="alert">{error}</div>}
      <div className="text-xs text-gray-400 mt-2 text-center max-w-xs">
        <span role="img" aria-label="lock">🔒</span> Your voice is never sent to a server. All processing is local for privacy and anonymization.
      </div>
    </div>
  );
}
