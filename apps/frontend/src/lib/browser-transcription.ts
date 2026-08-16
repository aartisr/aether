/**
 * Private, browser-only transcription fallback for Echo.
 *
 * The first use downloads static model/WASM files from the model host and
 * caches them in the browser. Audio and resulting text are never uploaded.
 */
const MODEL_ID = 'Xenova/whisper-tiny.en';

export type BrowserTranscriptionProgress = {
  phase: 'loading-model' | 'transcribing';
  detail: string;
};

type Transcriber = (audio: string) => Promise<unknown>;

let transcriberPromise: Promise<Transcriber> | undefined;

export async function transcribeAudioInBrowser(
  audio: Blob,
  onProgress?: (progress: BrowserTranscriptionProgress) => void,
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Private transcription is available only in a browser.');
  }

  onProgress?.({ phase: 'loading-model', detail: 'Preparing the private transcription model…' });
  const transcriber = await getTranscriber(onProgress);
  const audioUrl = URL.createObjectURL(audio);

  try {
    onProgress?.({ phase: 'transcribing', detail: 'Transcribing on this device…' });
    const result = await transcriber(audioUrl);
    const transcript = getTranscriptText(result);

    if (!transcript) {
      throw new Error('The local model did not return a transcript.');
    }

    return transcript;
  } finally {
    URL.revokeObjectURL(audioUrl);
  }
}

async function getTranscriber(onProgress?: (progress: BrowserTranscriptionProgress) => void): Promise<Transcriber> {
  if (!transcriberPromise) {
    transcriberPromise = createTranscriber(onProgress).catch((error) => {
      // A transient download, cache, or browser-memory failure must not poison
      // later attempts in the same tab.
      transcriberPromise = undefined;
      throw error;
    });
  }

  return transcriberPromise;
}

async function createTranscriber(onProgress?: (progress: BrowserTranscriptionProgress) => void): Promise<Transcriber> {
  const { env, pipeline } = await import('@xenova/transformers');

  // Transformers.js caches these static resources in browser Cache Storage.
  // The initial model download is intentionally explicit in the Echo UI.
  env.allowRemoteModels = true;
  env.useBrowserCache = true;

  const pipelineResult = await pipeline('automatic-speech-recognition', MODEL_ID, {
    quantized: true,
    progress_callback: (event: unknown) => {
      onProgress?.({ phase: 'loading-model', detail: formatModelProgress(event) });
    },
  });

  return pipelineResult as unknown as Transcriber;
}

function formatModelProgress(event: unknown): string {
  if (!event || typeof event !== 'object') {
    return 'Downloading the private transcription model…';
  }

  const progress = (event as { progress?: unknown }).progress;
  if (typeof progress === 'number' && Number.isFinite(progress)) {
    return `Downloading the private transcription model… ${Math.min(100, Math.max(0, Math.round(progress)))}%`;
  }

  return 'Preparing the private transcription model…';
}

function getTranscriptText(result: unknown): string {
  if (!result || typeof result !== 'object' || !('text' in result)) {
    return '';
  }

  const text = (result as { text?: unknown }).text;
  return typeof text === 'string' ? text.trim() : '';
}
