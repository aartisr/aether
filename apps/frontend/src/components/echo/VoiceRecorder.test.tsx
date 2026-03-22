import { render, screen } from '@testing-library/react';
import VoiceRecorder from './VoiceRecorder';

describe('VoiceRecorder', () => {
  it('renders record button', () => {
    render(<VoiceRecorder />);
    expect(screen.getByRole('button')).toHaveTextContent(/start recording/i);
  });
});
