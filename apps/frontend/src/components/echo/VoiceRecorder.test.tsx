import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { prepareBrowserTranscription, transcribeAudioInBrowser } from '../../lib/browser-transcription';
import VoiceRecorder from './VoiceRecorder';

jest.mock('../../lib/browser-transcription', () => ({
  prepareBrowserTranscription: jest.fn(),
  transcribeAudioInBrowser: jest.fn(),
}));

// ─── Mock helpers ─────────────────────────────────────────────────────────────

type MockTrack = { stop: jest.Mock };

class MockMediaRecorder {
  static instance: MockMediaRecorder | null = null;
  mimeType = 'audio/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  static isTypeSupported = jest.fn(() => false);

  constructor(_stream: MediaStream, _options?: { mimeType?: string }) {
    MockMediaRecorder.instance = this;
  }

  start() { return undefined; }
  stop() {
    this.ondataavailable?.({ data: new Blob(['audio-bytes'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

class MockSpeechRecognition {
  static instance: MockSpeechRecognition | null = null;
  static available = jest.fn().mockResolvedValue('available');
  static install = jest.fn().mockResolvedValue(true);
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  processLocally = false;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  startCallCount = 0;

  constructor() { MockSpeechRecognition.instance = this; }
  start()  { this.startCallCount += 1; }
  stop()   { return undefined; }
  abort()  { return undefined; }
}

/** Build a synthetic SpeechRecognition results payload */
function makeSpeechEvent(parts: Array<{ transcript: string; isFinal: boolean }>) {
  const list = parts.map((p) => ({
    isFinal: p.isFinal,
    length: 1,
    0: { transcript: p.transcript, confidence: 0.9 },
  }));
  return { results: Object.assign(list, { length: parts.length }) };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('VoiceRecorder', () => {
  const getUserMedia = jest.fn();
  const createObjectURL = jest.fn(() => 'blob:mock-audio');
  const prepareBrowserTranscriptionMock = prepareBrowserTranscription as jest.MockedFunction<typeof prepareBrowserTranscription>;
  const transcribeAudioInBrowserMock = transcribeAudioInBrowser as jest.MockedFunction<typeof transcribeAudioInBrowser>;

  function makeStream(): { stream: MediaStream; track: MockTrack } {
    const track: MockTrack = { stop: jest.fn() };
    const stream = { getTracks: () => [track] } as unknown as MediaStream;
    return { stream, track };
  }

  beforeEach(() => {
    jest.useFakeTimers();
    getUserMedia.mockReset();
    createObjectURL.mockClear();
    transcribeAudioInBrowserMock.mockReset();
    prepareBrowserTranscriptionMock.mockReset();
    prepareBrowserTranscriptionMock.mockResolvedValue(undefined);
    MockMediaRecorder.instance = null;
    MockSpeechRecognition.instance = null;
    MockSpeechRecognition.available.mockResolvedValue('available');
    MockSpeechRecognition.install.mockResolvedValue(true);

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

  // ── Basic rendering ─────────────────────────────────────────────────────────

  it('renders record button and no text pad before recording', () => {
    render(<VoiceRecorder />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('respects custom button labels', () => {
    render(<VoiceRecorder recordButtonLabel="Begin" stopButtonLabel="Finish" />);
    expect(screen.getByRole('button', { name: 'Begin' })).toBeInTheDocument();
  });

  it('offers an explicit, desktop-oriented private rolling-caption opt-in', async () => {
    render(<VoiceRecorder />);

    expect(screen.getByText(/want captions while you speak/i)).toBeInTheDocument();
    expect(screen.getByText(/optional for desktop/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /enable private rolling captions/i }));

    await waitFor(() => {
      expect(prepareBrowserTranscriptionMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/private rolling captions are ready/i)).toBeInTheDocument();
    });
  });

  // ── Recording lifecycle ─────────────────────────────────────────────────────

  it('records audio, shows timer, fires callbacks, and shows playback on stop', async () => {
    const { stream, track } = makeStream();
    getUserMedia.mockResolvedValue(stream);
    const onRecordingComplete = jest.fn();
    const onCaptureComplete = jest.fn();

    render(<VoiceRecorder onRecordingComplete={onRecordingComplete} onCaptureComplete={onCaptureComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(screen.getByRole('button')).toHaveTextContent(/stop recording/i);
    });

    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('00:03')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      expect(onRecordingComplete).toHaveBeenCalledTimes(1);
      expect(onCaptureComplete).toHaveBeenCalledTimes(1);
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(track.stop).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText(/playback recorded audio/i)).toBeInTheDocument();
    });
  });

  // ── Text pad ────────────────────────────────────────────────────────────────

  it('shows text pad (textarea) once recording starts', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    expect(screen.queryByRole('textbox')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /voice transcript/i })).toBeInTheDocument();
    });
  });

  it('updates textarea with confirmed (isFinal) speech in real time', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'I feel steady', isFinal: true }]),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /voice transcript/i })).toHaveValue('I feel steady');
    });
  });

  it('emits live transcript updates to the parent callback as speech is finalized', async () => {
    const { stream } = makeStream();
    const onTranscriptChange = jest.fn();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder onTranscriptChange={onTranscriptChange} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'I feel steady today', isFinal: true }]),
      );
    });

    await waitFor(() => {
      expect(onTranscriptChange).toHaveBeenCalledWith('I feel steady today', 'speech-recognition');
    });
  });

  it('does NOT update textarea with interim-only results', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'not yet final', isFinal: false }]),
      );
    });

    await waitFor(() => expect(screen.queryByText(/hearing:/i)).toBeInTheDocument());
    // Textarea should remain empty — interim text is shown separately
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('shows interim text preview below the textarea while recognizing', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'thinking out loud', isFinal: false }]),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/hearing:/i)).toBeInTheDocument();
      expect(screen.getByText(/thinking out loud/i)).toBeInTheDocument();
    });
  });

  it('clears interim text when recording stops', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'hello world', isFinal: false }]),
      );
    });
    await waitFor(() => expect(screen.getByText(/hearing:/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      expect(screen.queryByText(/hearing:/i)).toBeNull();
    });
  });

  it('appends new confirmed speech without overwriting user edits', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);
    const onCaptureComplete = jest.fn();

    render(<VoiceRecorder onCaptureComplete={onCaptureComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    // Recognition confirms first sentence
    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'I feel okay', isFinal: true }]),
      );
    });
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('I feel okay'));

    // User manually corrects the text
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I feel great' } });
    expect(screen.getByRole('textbox')).toHaveValue('I feel great');

    // Recognition adds a new confirmed segment (delta is " today")
    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([
          { transcript: 'I feel okay', isFinal: true },
          { transcript: ' today', isFinal: true },
        ]),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('I feel great today');
    });

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
    await waitFor(() => {
      expect(onCaptureComplete).toHaveBeenCalledWith(
        expect.objectContaining({ transcript: 'I feel great today' }),
      );
    });
  });

  it('uses manually typed transcript (source=manual) in capture callback', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);
    const onCaptureComplete = jest.fn();

    render(<VoiceRecorder onCaptureComplete={onCaptureComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    fireEvent.change(screen.getByRole('textbox', { name: /voice transcript/i }), {
      target: { value: 'typed by user' },
    });

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      expect(onCaptureComplete).toHaveBeenCalledWith(
        expect.objectContaining({ transcript: 'typed by user', transcriptSource: 'manual' }),
      );
    });
  });

  it('emits manual transcript edits to the parent callback', async () => {
    const { stream } = makeStream();
    const onTranscriptChange = jest.fn();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder onTranscriptChange={onTranscriptChange} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    fireEvent.change(screen.getByRole('textbox', { name: /voice transcript/i }), {
      target: { value: 'typed by user' },
    });

    expect(onTranscriptChange).toHaveBeenLastCalledWith('typed by user', 'manual');
  });

  // ── Live indicator ────────────────────────────────────────────────────────────

  it('shows live transcription indicator when speech recognition produces results', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'test', isFinal: true }]),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/live transcription/i)).toBeInTheDocument();
    });
  });

  // ── Auto-restart ──────────────────────────────────────────────────────────────

  it('auto-restarts SpeechRecognition on onend while recording is active', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    const recognition = MockSpeechRecognition.instance!;
    const countBefore = recognition.startCallCount; // 1 (initial start)

    // Simulate Chrome's silence-timeout firing onend
    act(() => { recognition.onend?.(); });

    expect(recognition.startCallCount).toBe(countBefore + 1);
  });

  it('does NOT restart SpeechRecognition on onend after recording has stopped', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /start recording/i }));

    const recognition = MockSpeechRecognition.instance!;
    const countAfterStop = recognition.startCallCount;

    act(() => { recognition.onend?.(); });

    expect(recognition.startCallCount).toBe(countAfterStop);
  });

  // ── Transcription unavailable ─────────────────────────────────────────────────

  it('shows notice when SpeechRecognition is not available in the browser', async () => {
    Object.defineProperty(window, 'SpeechRecognition', { value: undefined, configurable: true });
    Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined, configurable: true });

    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/this browser can record privately/i);
    });
  });

  it('refuses browser speech recognition when private on-device support is unavailable', async () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      value: class CloudOnlySpeechRecognition {
        continuous = false;
        interimResults = false;
        lang = 'en-US';
        processLocally = false;
        onresult = null;
        onerror = null;
        onend = null;

        start() { return undefined; }
        stop() { return undefined; }
        abort() { return undefined; }
      },
      configurable: true,
    });

    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/this browser can record privately/i);
    });
    expect(MockSpeechRecognition.instance).toBeNull();
  });

  it('downloads a local language pack before starting private dictation', async () => {
    MockSpeechRecognition.available.mockResolvedValue('downloadable');
    MockSpeechRecognition.install.mockResolvedValue(true);
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(MockSpeechRecognition.install).toHaveBeenCalledWith({
        langs: ['en-US'],
        processLocally: true,
        quality: 'dictation',
      });
      expect(MockSpeechRecognition.instance?.processLocally).toBe(true);
    });
  });

  it('explains when a private local language pack is unavailable', async () => {
    MockSpeechRecognition.available.mockResolvedValue('unavailable');
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/this browser can record privately/i);
    });
  });

  it('waits for a private language pack that is already downloading', async () => {
    MockSpeechRecognition.available.mockResolvedValue('downloading');
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/private live captions are still preparing/i);
    });
    expect(MockSpeechRecognition.instance).toBeNull();
  });

  it('keeps recording local when the browser cannot check private dictation availability', async () => {
    MockSpeechRecognition.available.mockRejectedValue(new Error('capability check failed'));
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/this browser can record privately/i);
    });
    expect(MockSpeechRecognition.instance).toBeNull();
  });

  it('keeps recording local when the private language pack installation fails', async () => {
    MockSpeechRecognition.available.mockResolvedValue('downloadable');
    MockSpeechRecognition.install.mockResolvedValue(false);
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/this browser can record privately/i);
    });
    expect(MockSpeechRecognition.instance).toBeNull();
  });

  it('shows actionable notice for SpeechRecognition network error', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => { MockSpeechRecognition.instance?.onerror?.({ error: 'network' }); });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/speech-recognition service/i);
    });
  });

  it('treats an early not-allowed error as microphone setup in progress and retries transcription', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    const recognition = MockSpeechRecognition.instance!;
    expect(recognition.startCallCount).toBe(1);

    act(() => { recognition.onerror?.({ error: 'not-allowed' }); });

    expect(screen.getByRole('status')).toHaveTextContent(/finishing microphone permission setup/i);
    expect(screen.queryByText(/revoked mid-session/i)).toBeNull();

    act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(recognition.startCallCount).toBe(2);

    act(() => {
      recognition.onresult?.(
        makeSpeechEvent([{ transcript: 'I feel steady now', isFinal: true }]),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /voice transcript/i })).toHaveValue('I feel steady now');
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  it('keeps the stronger revoked warning for permission loss after transcription has started', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => {
      MockSpeechRecognition.instance?.onresult?.(
        makeSpeechEvent([{ transcript: 'I feel steady now', isFinal: true }]),
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /voice transcript/i })).toHaveValue('I feel steady now');
    });

    act(() => { MockSpeechRecognition.instance?.onerror?.({ error: 'not-allowed' }); });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/revoked mid-session/i);
    });
  });

  it('silently ignores no-speech SpeechRecognition errors', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => { MockSpeechRecognition.instance?.onerror?.({ error: 'no-speech' }); });

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // ── Microphone error messages ─────────────────────────────────────────────────

  it('shows specific message when microphone permission is denied (NotAllowedError)', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/click the lock icon/i);
    });
  });

  it('shows specific message when no microphone is found (NotFoundError)', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Device not found', 'NotFoundError'));

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/no microphone was found/i);
    });
  });

  it('shows specific message when microphone is in use by another app (NotReadableError)', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Device busy', 'NotReadableError'));

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/in use by another app/i);
    });
  });

  it('shows specific message when microphone access is aborted (AbortError)', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/interrupted/i);
    });
  });

  it('shows generic fallback message for unrecognised errors', async () => {
    getUserMedia.mockRejectedValue(new Error('unknown'));

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/check your browser permissions/i);
    });
  });

  it('shows specific message when MediaDevices API is unavailable (HTTP page)', async () => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    });

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/secure \(https\) connection/i);
    });
  });

  it('shows specific message when MediaRecorder API is not supported', async () => {
    Object.defineProperty(global, 'MediaRecorder', { value: undefined, configurable: true });

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/audio recording is not supported/i);
    });
  });

  // ── Playback ──────────────────────────────────────────────────────────────────

  it('renders playback audio element with correct src after recording stops', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    expect(screen.queryByLabelText(/playback recorded audio/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      const audio = screen.getByLabelText(/playback recorded audio/i);
      expect(audio).toBeInTheDocument();
      expect(audio).toHaveAttribute('src', 'blob:mock-audio');
    });
  });

  it('offers explicit browser-only transcription after recording when no live transcript is available', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);
    transcribeAudioInBrowserMock.mockImplementation(async (_audio, onProgress) => {
      onProgress?.({ phase: 'loading-model', detail: 'Preparing the private transcription model…' });
      onProgress?.({ phase: 'transcribing', detail: 'Transcribing on this device…' });
      return 'I feel calmer after taking a break.';
    });
    const onTranscriptChange = jest.fn();

    render(<VoiceRecorder onTranscriptChange={onTranscriptChange} />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    const privateTranscription = await screen.findByRole('button', { name: /transcribe privately on this device/i });
    fireEvent.click(privateTranscription);

    await waitFor(() => {
      expect(transcribeAudioInBrowserMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('textbox', { name: /voice transcript/i })).toHaveValue('I feel calmer after taking a break.');
    });
    expect(onTranscriptChange).toHaveBeenLastCalledWith('I feel calmer after taking a break.', 'on-device-model');
  });

  it('keeps the recording usable and offers a retry when private transcription fails', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);
    transcribeAudioInBrowserMock.mockRejectedValue(new Error('model download failed'));

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    const privateTranscription = await screen.findByRole('button', { name: /transcribe privately on this device/i });
    fireEvent.click(privateTranscription);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/could not start in this browser/i);
    });
    expect(screen.getByLabelText(/playback recorded audio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transcribe privately on this device/i })).toBeEnabled();
  });
});
