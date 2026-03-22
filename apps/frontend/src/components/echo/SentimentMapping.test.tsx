import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SentimentMapping from './SentimentMapping';

describe('SentimentMapping', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('renders analyze button and disables it when audio is missing', () => {
    render(<SentimentMapping audio={null} />);
    const button = screen.getByRole('button', { name: /analyze sentiment/i });
    expect(button).toBeDisabled();
  });

  it('runs analysis and renders sentiment result', async () => {
    const audio = new Blob(['sample'], { type: 'audio/webm' });
    const analyzeSentiment = jest.fn().mockResolvedValue({ score: 0.42, label: 'Positive' });

    render(<SentimentMapping audio={audio} analyzeSentiment={analyzeSentiment} />);

    const button = screen.getByRole('button', { name: /analyze sentiment/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(analyzeSentiment).toHaveBeenCalledWith(audio);
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Positive');
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('(0.42)');
    });
  });

  it('shows loading state while analysis is pending', async () => {
    const audio = new Blob(['sample'], { type: 'audio/webm' });
    let resolveAnalysis: ((value: { score: number; label: string }) => void) | undefined;
    const analyzeSentiment = jest.fn(
      () =>
        new Promise<{ score: number; label: string }>((resolve) => {
          resolveAnalysis = resolve;
        }),
    );

    render(<SentimentMapping audio={audio} analyzeSentiment={analyzeSentiment} />);

    fireEvent.click(screen.getByRole('button', { name: /analyze sentiment/i }));

    expect(screen.getByRole('button')).toHaveTextContent(/analyzing/i);
    expect(screen.getByRole('button')).toBeDisabled();

    resolveAnalysis?.({ score: -0.5, label: 'Negative' });

    await waitFor(() => {
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Negative');
    });
  });

  it('uses default analyzer and returns Positive for high random score', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const audio = new Blob(['sample'], { type: 'audio/webm' });

    render(<SentimentMapping audio={audio} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze sentiment/i }));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    await waitFor(() => {
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Positive');
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('(0.80)');
    });
  });

  it('uses default analyzer and returns Neutral for mid random score', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const audio = new Blob(['sample'], { type: 'audio/webm' });

    render(<SentimentMapping audio={audio} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze sentiment/i }));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    await waitFor(() => {
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Neutral');
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('(0.00)');
    });
  });

  it('uses default analyzer and returns Negative for low random score', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const audio = new Blob(['sample'], { type: 'audio/webm' });

    render(<SentimentMapping audio={audio} />);
    fireEvent.click(screen.getByRole('button', { name: /analyze sentiment/i }));

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    await waitFor(() => {
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Negative');
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('(-0.80)');
    });
  });
});
