import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('VoiceRecorder', () => {
  const getUserMedia = jest.fn();
  const createObjectURL = jest.fn(() => 'blob:mock-audio');

  beforeEach(() => {
    jest.useFakeTimers();
    getUserMedia.mockReset();
    createObjectURL.mockClear();

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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders record button', () => {
    render(<VoiceRecorder />);
    expect(screen.getByRole('button')).toHaveTextContent(/start recording/i);
  });

  it('records audio and calls completion callback on stop', async () => {
    const track: MockTrack = { stop: jest.fn() };
    const stream = { getTracks: () => [track] } as unknown as MediaStream;
    getUserMedia.mockResolvedValue(stream);
    const onRecordingComplete = jest.fn();
    const onCaptureComplete = jest.fn();

    render(<VoiceRecorder onRecordingComplete={onRecordingComplete} onCaptureComplete={onCaptureComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(screen.getByRole('button')).toHaveTextContent(/stop recording/i);
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:02')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));

    await waitFor(() => {
      expect(onRecordingComplete).toHaveBeenCalledTimes(1);
      expect(onCaptureComplete).toHaveBeenCalledTimes(1);
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(track.stop).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText(/playback recorded audio/i)).toBeInTheDocument();
    });
  });

  it('shows an error when microphone access fails', async () => {
    getUserMedia.mockRejectedValue(new Error('denied'));

    render(<VoiceRecorder />);

    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/microphone access denied/i);
    });
  });
});
