import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SentimentMapping from './SentimentMapping';

describe('SentimentMapping', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders analyze button and disables it when transcript is missing', () => {
    render(<SentimentMapping audio={null} />);
    const button = screen.getByRole('button', { name: /analyze check-in/i });
    expect(button).toBeDisabled();
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
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Positive');
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('(0.42)');
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
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Negative');
    });
  });

  it('supports manual transcript edits before analysis', async () => {
    render(<SentimentMapping audio={null} transcript="I feel okay" />);

    fireEvent.change(screen.getByLabelText(/transcript for local analysis/i), {
      target: { value: 'I feel overwhelmed and hopeless' },
    });
    fireEvent.click(screen.getByRole('button', { name: /analyze check-in/i }));

    await waitFor(() => {
      expect(screen.getByText(/sentiment:/i)).toHaveTextContent('Negative');
      expect(screen.getByText(/safety signal:/i)).toHaveTextContent('medium');
    });
  });
});
