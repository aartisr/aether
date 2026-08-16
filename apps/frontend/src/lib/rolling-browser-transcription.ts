import { transcribeAudioInBrowser } from './browser-transcription';

export type RollingCaptionSession = {
  updateAudioSnapshot: (audio: Blob) => void;
  reset: () => void;
};

/**
 * Serializes browser-only transcription work for progressively larger, valid
 * recording snapshots. A MediaRecorder chunk is not guaranteed to be a
 * standalone media file, so callers provide the complete recording so far.
 * This intentionally exposes delayed, rolling captions—not instant speech.
 */
export function createRollingCaptionSession(options: {
  onTranscript: (transcript: string) => void;
  onStatus?: (status: string) => void;
}): RollingCaptionSession {
  let generation = 0;
  let pendingAudio: Blob | null = null;
  let processing = false;

  const processLatestSnapshot = async () => {
    if (processing) return;
    processing = true;

    while (pendingAudio) {
      const audio = pendingAudio;
      pendingAudio = null;
      const currentGeneration = generation;

      try {
        options.onStatus?.('Updating private captions…');
        const transcript = await transcribeAudioInBrowser(audio);
        if (currentGeneration === generation && transcript) {
          options.onTranscript(transcript);
          options.onStatus?.('Private captions are up to date.');
        }
      } catch {
        if (currentGeneration === generation) {
          options.onStatus?.('Private captions paused. You can keep recording and transcribe when you finish.');
        }
      }
    }

    processing = false;
  };

  return {
    updateAudioSnapshot(audio) {
      pendingAudio = audio;
      void processLatestSnapshot();
    },
    reset() {
      generation += 1;
      pendingAudio = null;
    },
  };
}
