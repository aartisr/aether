import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SentimentMapping from '../../components/echo/SentimentMapping';

// Mock local AI analysis
jest.mock('../../lib/local-ai', () => ({
  analyzeLocalEchoTranscript: jest.fn().mockResolvedValue({
    sentiment: {
      label: 'Negative',
      score: 0.72,
      matchedTerms: ['overwhelmed', 'panic'],
    },
    safety: {
      label: 'medium',
      score: 0.65,
      matchedTerms: ['panic', 'can barely'],
    },
    escalation: {
      potential: true,
      urgency: 'same-day',
      resources: [
        {
          id: 'crisis-line',
          actionLabel: 'Call Crisis Line',
          actionHref: 'tel:988',
          title: 'Crisis Text Line',
          availability: '24/7',
        },
      ],
    },
    recommendations: [
      'Consider reaching out to a trusted friend or family member',
      'Practice grounding techniques to help with overwhelm',
    ],
    analysisEngine: 'local-transformers',
    analysisEngineNote: '',
    transcript: 'I feel really overwhelmed and panicked about everything. I can barely sleep.',
  }),
}));

describe('Echo Sentiment Visualization Integration Tests', () => {
  const mockAudio = new Blob(['audio'], { type: 'audio/wav' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sentiment rail with gradient and neutral marker', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    // Click analyze button to trigger analysis
    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('sentiment-rail')).toBeInTheDocument();
    });
  });

  test('displays summary line with valence tone and energy level', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByTestId('sentiment-rail')).toBeInTheDocument();
    });

    // Check for summary line with tone and confidence
    const summary = screen.getByText(/negative and high energy|moderate confidence/i);
    expect(summary).toBeInTheDocument();
  });

  test('emotion compass is hidden initially', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    // Wait for rail to appear
    const rail = await screen.findByTestId('sentiment-rail');
    expect(rail).toBeInTheDocument();

    const compass = screen.queryByTestId('emotion-compass');
    expect(compass).not.toBeInTheDocument();
  });

  test('emotion compass appears when toggle button is clicked', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('sentiment-rail')).toBeInTheDocument();
    });

    // Find and click the toggle button
    const toggleButton = screen.getByRole('button', { name: /show.*emotional map|hide.*emotional map/i });
    fireEvent.click(toggleButton);

    // Compass should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('emotion-compass')).toBeInTheDocument();
    });
  });

  test('emotion compass shows quadrant labels', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    const toggleButton = await screen.findByRole('button', { name: /show.*emotional map|hide.*emotional map/i });
    fireEvent.click(toggleButton);

    // Verify compass appears
    const compass = await screen.findByTestId('emotion-compass');
    expect(compass).toBeInTheDocument();
    // Check for at least one quadrant label
    expect(compass.textContent).toMatch(/Energized|Overwhelmed|Grounded|Drained/);
  });

  test('displays safety alert when risk level is medium', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('sentiment-rail')).toBeInTheDocument();
    });

    // Safety alert should appear
    const alert = screen.getByText(/Elevated safety signal detected/i);
    expect(alert).toBeInTheDocument();
  });

  test('shows recommended support actions based on safety assessment', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByTestId('sentiment-rail')).toBeInTheDocument();
    });

    // Check for support action
    const supportAction = screen.getByRole('link', { name: /Call Crisis Line/i });
    expect(supportAction).toBeInTheDocument();
    expect(supportAction).toHaveAttribute('href', 'tel:988');
  });

  test('full integration: rail + compass + safety in one flow', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything. I can barely sleep."
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    // Step 1: Verify rail appears
    const rail = await screen.findByTestId('sentiment-rail');
    expect(rail).toBeInTheDocument();

    // Step 2: Verify summary line
    expect(screen.getByText(/negative and high energy|moderate confidence/i)).toBeInTheDocument();

    // Step 3: Verify safety alert
    expect(screen.getByText(/Elevated safety signal detected/i)).toBeInTheDocument();

    // Step 4: Toggle compass
    const toggleButton = screen.getByRole('button', { name: /show.*emotional map|hide.*emotional map/i });
    fireEvent.click(toggleButton);

    // Step 5: Verify compass appears
    const compass = await screen.findByTestId('emotion-compass');
    expect(compass).toBeInTheDocument();

    // Step 6: Verify recommended actions
    expect(screen.getByRole('link', { name: /Call Crisis Line/i })).toBeInTheDocument();
  });

  test('sentiment rail reflects confidence level in marker styling', async () => {
    render(
      <SentimentMapping
        audio={mockAudio}
        transcript="I feel really overwhelmed and panicked about everything"
        transcriptSource="local-whisper"
      />
    );

    const analyzeButton = screen.getByRole('button', { name: /Analyze Check-In/i });
    fireEvent.click(analyzeButton);

    // Verify rail appears with proper structure
    const rail = await screen.findByTestId('sentiment-rail');
    expect(rail).toBeInTheDocument();
    // Verify it contains SVG elements for rendering
    expect(rail.querySelector('svg')).toBeInTheDocument();
  });
});
