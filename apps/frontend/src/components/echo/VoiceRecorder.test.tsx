import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import VoiceRecorder from './VoiceRecorder';

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
  continuous = false;
  interimResults = false;
  lang = 'en-US';
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

  function makeStream(): { stream: MediaStream; track: MockTrack } {
    const track: MockTrack = { stop: jest.fn() };
    const stream = { getTracks: () => [track] } as unknown as MediaStream;
    return { stream, track };
  }

  beforeEach(() => {
    jest.useFakeTimers();
    getUserMedia.mockReset();
    createObjectURL.mockClear();
    MockMediaRecorder.instance = null;
    MockSpeechRecognition.instance = null;

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
    expect(screen.getByRole('button')).toHaveTextContent(/start recording/i);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('respects custom button labels', () => {
    render(<VoiceRecorder recordButtonLabel="Begin" stopButtonLabel="Finish" />);
    expect(screen.getByRole('button')).toHaveTextContent('Begin');
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
      expect(screen.getByRole('status')).toHaveTextContent(/live transcription is not available/i);
    });
  });

  it('shows actionable notice for SpeechRecognition network error', async () => {
    const { stream } = makeStream();
    getUserMedia.mockResolvedValue(stream);

    render(<VoiceRecorder />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    await waitFor(() => screen.getByRole('button', { name: /stop recording/i }));

    act(() => { MockSpeechRecognition.instance?.onerror?.({ error: 'network' }); });

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/network connection/i);
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
});
