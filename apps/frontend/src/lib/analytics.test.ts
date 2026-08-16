import { subscribeToAnalytics, track } from './analytics';

describe('analytics signals', () => {
  it('removes sensitive properties and redacts contact-shaped values', () => {
    const received: Array<{ name: string; properties: Record<string, unknown> }> = [];
    const unsubscribe = subscribeToAnalytics((event) => received.push(event));

    track('safe_event', {
      mode: 'guided',
      email: 'student@example.edu',
      label: 'student@example.edu',
      issue: 'Free form content must not leave the device',
    });

    unsubscribe();

    expect(received).toEqual([
      {
        name: 'safe_event',
        properties: { mode: 'guided', label: '[redacted]' },
      },
    ]);
  });

  it('delivers a bounded early event once an adapter is ready', () => {
    track('early_event', { feature: 'resilience_hub' });
    const received: string[] = [];

    const unsubscribe = subscribeToAnalytics((event) => received.push(event.name));
    unsubscribe();

    expect(received).toContain('early_event');
  });
});
