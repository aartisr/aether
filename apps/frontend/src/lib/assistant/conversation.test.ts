import { createAssistantReply, getAssistantContextProfile, getAssistantWelcome } from './conversation';

describe('conversation assistant', () => {
  it('creates context-aware welcome messages', () => {
    const welcome = getAssistantWelcome('/peer-navigator');

    expect(welcome.contextLabel).toBe('Peer Navigator');
    expect(welcome.answer).toContain('Peer Navigator');
    expect(welcome.sources[0].href).toBe('/peer-navigator');
    expect(welcome.actions.map((action) => action.href)).toContain(
      'https://github.com/aartisr/aether/blob/main/docs/peer-navigator-network-implementation-plan.md',
    );
  });

  it('answers peer navigator questions with peer sources', () => {
    const reply = createAssistantReply({
      message: 'How does peer matching work?',
      contextPath: '/peer-navigator',
    });

    expect(reply.answer).toContain('safety-gated');
    expect(reply.sources.map((source) => source.href)).toContain('/peer-navigator');
    expect(reply.sources.map((source) => source.href)).toContain(
      'https://github.com/aartisr/aether/blob/main/docs/peer-matching-algorithm.md',
    );
    expect(reply.actions.map((action) => action.label)).toContain('Review Peer-Navigator plan');
  });

  it('routes crisis language to urgent support boundaries', () => {
    const reply = createAssistantReply({
      message: 'I might hurt myself and this is an emergency',
      contextPath: '/',
    });

    expect(reply.answer).toContain('988');
    expect(reply.sources.map((source) => source.href)).toContain('https://988lifeline.org/');
  });

  it('normalizes nested paths to the closest context', () => {
    expect(getAssistantContextProfile('/blog/example-post').label).toBe('Aether Journal');
  });
});
