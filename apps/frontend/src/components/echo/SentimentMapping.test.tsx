import { render, screen } from '@testing-library/react';
import SentimentMapping from './SentimentMapping';

describe('SentimentMapping', () => {
  it('renders analyze button', () => {
    render(<SentimentMapping audio={null} />);
    expect(screen.getByRole('button')).toHaveTextContent(/analyze sentiment/i);
  });
});
