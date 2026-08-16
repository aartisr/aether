import { transcribeAudioInBrowser } from './browser-transcription';
import { createRollingCaptionSession } from './rolling-browser-transcription';

jest.mock('./browser-transcription', () => ({
  transcribeAudioInBrowser: jest.fn(),
}));

describe('createRollingCaptionSession', () => {
  const transcribe = transcribeAudioInBrowser as jest.MockedFunction<typeof transcribeAudioInBrowser>;

  beforeEach(() => jest.resetAllMocks());

  it('uses the latest valid recording snapshot for captions', async () => {
    transcribe.mockResolvedValueOnce('First thought').mockResolvedValueOnce('First thought, clarified');
    const onTranscript = jest.fn();
    const session = createRollingCaptionSession({ onTranscript });

    session.updateAudioSnapshot(new Blob(['first']));
    session.updateAudioSnapshot(new Blob(['first', 'second']));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(transcribe).toHaveBeenCalledTimes(2);
    expect(onTranscript).toHaveBeenLastCalledWith('First thought, clarified');
  });

  it('discards queued output after reset', async () => {
    let resolveTranscription: ((value: string) => void) | undefined;
    transcribe.mockImplementation(() => new Promise((resolve) => { resolveTranscription = resolve; }));
    const onTranscript = jest.fn();
    const session = createRollingCaptionSession({ onTranscript });

    session.updateAudioSnapshot(new Blob(['first']));
    await Promise.resolve();
    session.reset();
    resolveTranscription?.('Discard this');
    await Promise.resolve();
    await Promise.resolve();

    expect(onTranscript).not.toHaveBeenCalled();
  });
});
