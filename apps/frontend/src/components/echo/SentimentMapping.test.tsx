import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SentimentMapping from './SentimentMapping';

describe('SentimentMapping', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders analyze button and disables it when transcript is missing', () => {
    render(<SentimentMapping audio={null} />);
    const button = screen.getByRole('button', { name: /analyze check-in/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/record or type at least 3 words to enable analysis/i)).toBeInTheDocument();
  });

  it('enforces a 3-word minimum transcript threshold', () => {
    render(<SentimentMapping audio={null} transcript="I feel" />);
    const button = screen.getByRole('button', { name: /analyze check-in/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/add 1 more word to enable analysis/i)).toBeInTheDocument();
  });

  it('shows no-transcript fallback guidance after a recording with unavailable speech recognition', () => {
    const audio = new Blob(['sample'], { type: 'audio/webm' });
    render(<SentimentMapping audio={audio} transcript="" transcriptSource="unavailable" />);
    expect(screen.getByText(/no transcript was detected from recording/i)).toBeInTheDocument();
  });

  it('runs analysis and renders sentiment and safety results', async () => {
    const audio = new Blob(['sample'], { type: 'audio/webm' });
    const analyzeSentiment = jest.fn().mockResolvedValue({
      transcript: 'I feel steady',
      sentiment: { score: 0.42, label: 'Positive', matchedTerms: ['steady'] },
      safety: { score: 0.1, label: 'low', matchedTerms: [] },
      recommendations: ['Notice what helped you feel more steady today.'],
      escalation: {
        urgency: 'routine',
        rationale: ['No urgent risk markers detected in this transcript.'],
        resources: [
          {
            id: 'peer-circle',
            title: 'Peer Support Circle',
            availability: 'Daily sessions',
            actionLabel: 'Open Peer Navigator',
            actionHref: '/peer-navigator',
          },
        ],
      },
      analysisEngine: 'rules-keyword',
    });

    render(<SentimentMapping audio={audio} transcript="I feel steady" analyzeSentiment={analyzeSentiment} />);

    const button = screen.getByRole('button', { name: /analyze check-in/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(analyzeSentiment).toHaveBeenCalledWith({ audio, transcript: 'I feel steady' });
      expect(screen.getByText(/sentiment rail/i)).toBeInTheDocument();
      expect(screen.getByText(/leaning positive and moderate energy/i)).toBeInTheDocument();
      expect(screen.getByText(/safety signal:/i)).toHaveTextContent('low');
    });
  });

  it('shows loading state while analysis is pending', async () => {
    const audio = new Blob(['sample'], { type: 'audio/webm' });
    let resolveAnalysis:
      | ((value: {
          transcript: string;
          sentiment: { score: number; label: 'Negative'; matchedTerms: string[] };
          safety: { score: number; label: 'medium'; matchedTerms: string[] };
          recommendations: string[];
          escalation: {
            urgency: 'same-day';
            rationale: string[];
            resources: Array<{
              id: string;
              title: string;
              availability: string;
              actionLabel: string;
              actionHref: string;
            }>;
          };
          analysisEngine: string;
        }) => void)
      | undefined;
    const analyzeSentiment = jest.fn(
      () =>
        new Promise<{
          transcript: string;
          sentiment: { score: number; label: 'Negative'; matchedTerms: string[] };
          safety: { score: number; label: 'medium'; matchedTerms: string[] };
          recommendations: string[];
          escalation: {
            urgency: 'same-day';
            rationale: string[];
            resources: Array<{
              id: string;
              title: string;
              availability: string;
              actionLabel: string;
              actionHref: string;
            }>;
          };
          analysisEngine: string;
        }>((resolve) => {
          resolveAnalysis = resolve;
        }),
    );

    render(<SentimentMapping audio={audio} transcript="I feel overwhelmed" analyzeSentiment={analyzeSentiment} />);

    fireEvent.click(screen.getByRole('button', { name: /analyze check-in/i }));

    expect(screen.getByRole('button')).toHaveTextContent(/analyzing/i);
    expect(screen.getByRole('button')).toBeDisabled();

    resolveAnalysis?.({
      transcript: 'I feel overwhelmed',
      sentiment: { score: 0.5, label: 'Negative', matchedTerms: ['overwhelmed'] },
      safety: { score: 0.67, label: 'medium', matchedTerms: ['panic'] },
      recommendations: ['Pause and ground yourself with one small physical reset.'],
      escalation: {
        urgency: 'same-day',
        rationale: ['Elevated distress or sustained pressure detected.'],
        resources: [
          {
            id: 'campus-counseling',
            title: 'Campus Counseling Linkout',
            availability: 'Campus hours',
            actionLabel: 'Build Referral Notes',
            actionHref: '#safety-plan',
          },
        ],
      },
      analysisEngine: 'rules-keyword',
    });

    await waitFor(() => {
      expect(screen.getByText(/negative and high energy/i)).toBeInTheDocument();
    });
  });

  it('shows and hides the emotion compass on demand', async () => {
    const audio = new Blob(['sample'], { type: 'audio/webm' });
    const analyzeSentiment = jest.fn().mockResolvedValue({
      transcript: 'I feel steady',
      sentiment: { score: 0.42, label: 'Positive', matchedTerms: ['steady'] },
      safety: { score: 0.1, label: 'low', matchedTerms: [] },
      recommendations: ['Notice what helped you feel more steady today.'],
      escalation: {
        urgency: 'routine',
        rationale: ['No urgent risk markers detected in this transcript.'],
        resources: [
          {
            id: 'peer-circle',
            title: 'Peer Support Circle',
            availability: 'Daily sessions',
            actionLabel: 'Open Peer Navigator',
            actionHref: '/peer-navigator',
          },
        ],
      },
      analysisEngine: 'rules-keyword',
    });

    render(<SentimentMapping audio={audio} transcript="I feel steady" analyzeSentiment={analyzeSentiment} />);

    fireEvent.click(screen.getByRole('button', { name: /analyze check-in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /show emotional map/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /show emotional map/i }));
    expect(screen.getByText(/emotion compass/i)).toBeInTheDocument();
    expect(screen.getByText(/current zone:/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide emotional map/i }));
    expect(screen.queryByText(/emotion compass/i)).not.toBeInTheDocument();
  });

  it('shows warm-up status if first local analysis takes longer', async () => {
    jest.useFakeTimers();

    try {
      const audio = new Blob(['sample'], { type: 'audio/webm' });
      let resolveAnalysis:
        | ((value: {
            transcript: string;
            sentiment: { score: number; label: 'Neutral'; matchedTerms: string[] };
            safety: { score: number; label: 'low'; matchedTerms: string[] };
            recommendations: string[];
            escalation: {
              urgency: 'routine';
              rationale: string[];
              resources: Array<{
                id: string;
                title: string;
                availability: string;
                actionLabel: string;
                actionHref: string;
              }>;
            };
            analysisEngine: string;
          }) => void)
        | undefined;

      const analyzeSentiment = jest.fn(
        () =>
          new Promise<{
            transcript: string;
            sentiment: { score: number; label: 'Neutral'; matchedTerms: string[] };
            safety: { score: number; label: 'low'; matchedTerms: string[] };
            recommendations: string[];
            escalation: {
              urgency: 'routine';
              rationale: string[];
              resources: Array<{
                id: string;
                title: string;
                availability: string;
                actionLabel: string;
                actionHref: string;
              }>;
            };
            analysisEngine: string;
          }>((resolve) => {
            resolveAnalysis = resolve;
          }),
      );

      render(<SentimentMapping audio={audio} transcript="I feel calm and okay" analyzeSentiment={analyzeSentiment} />);

      fireEvent.click(screen.getByRole('button', { name: /analyze check-in/i }));

      expect(screen.getByText(/analyzing check-in locally/i)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1300);
      });

      expect(screen.getByText(/model warming up locally/i)).toBeInTheDocument();

      resolveAnalysis?.({
        transcript: 'I feel calm and okay',
        sentiment: { score: 0.51, label: 'Neutral', matchedTerms: ['okay'] },
        safety: { score: 0.1, label: 'low', matchedTerms: [] },
        recommendations: ['Keep doing what helps you stay steady.'],
        escalation: {
          urgency: 'routine',
          rationale: ['No urgent risk markers detected in this transcript.'],
          resources: [
            {
              id: 'peer-circle',
              title: 'Peer Support Circle',
              availability: 'Daily sessions',
              actionLabel: 'Open Peer Navigator',
              actionHref: '/peer-navigator',
            },
          ],
        },
        analysisEngine: 'transformers-local-hybrid',
      });

      await waitFor(() => {
        expect(screen.queryByText(/model warming up locally/i)).not.toBeInTheDocument();
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('supports manual transcript edits before analysis', async () => {
    render(<SentimentMapping audio={null} transcript="I feel okay" />);

    fireEvent.change(screen.getByLabelText(/transcript for local analysis/i), {
      target: { value: 'I feel overwhelmed and hopeless' },
    });
    fireEvent.click(screen.getByRole('button', { name: /analyze check-in/i }));

    await waitFor(() => {
      expect(screen.getByText(/negative and high energy/i)).toBeInTheDocument();
      expect(screen.getByText(/safety signal:/i)).toHaveTextContent('medium');
    });
  });
});
