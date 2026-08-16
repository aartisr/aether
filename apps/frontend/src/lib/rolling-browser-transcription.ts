import { transcribeAudioInBrowser } from './browser-transcription';

export type RollingCaptionSession = {
  addAudioChunk: (chunk: Blob) => void;
  reset: () => void;
};

/**
 * Serializes browser-only transcription work for independently recorded audio
 * segments. It intentionally exposes delayed, rolling captions—not a claim of
 * instantaneous speech recognition.
 */
export function createRollingCaptionSession(options: {
  onTranscript: (transcript: string) => void;
  onStatus?: (status: string) => void;
}): RollingCaptionSession {
  let transcript = '';
  let generation = 0;
  let queue = Promise.resolve();

  return {
    addAudioChunk(chunk) {
      const currentGeneration = generation;
      queue = queue
        .then(async () => {
          options.onStatus?.('Updating private captions…');
          const next = await transcribeAudioInBrowser(chunk);
          if (currentGeneration !== generation || !next) return;
          transcript = transcript ? `${transcript.trimEnd()} ${next}` : next;
          options.onTranscript(transcript);
          options.onStatus?.('Private captions are up to date.');
        })
        .catch(() => {
          if (currentGeneration === generation) {
            options.onStatus?.('Private captions paused. You can keep recording and transcribe when you finish.');
          }
        });
    },
    reset() {
      generation += 1;
      transcript = '';
      queue = Promise.resolve();
    },
  };
}
