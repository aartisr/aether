import {
  createPeerNavigatorMatcher,
  peerNavigatorBackgrounds,
  runPeerNavigatorMatch,
} from './peer-navigator-demo';

describe('peer navigator demo module', () => {
  it('keeps demo matching data and behavior reusable outside the page component', () => {
    const matcher = createPeerNavigatorMatcher();
    const result = runPeerNavigatorMatch(peerNavigatorBackgrounds[0], matcher);

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0]).toMatchObject({
      background: 'First-generation College Student',
    });
    expect(result.metrics?.totalProfiles).toBeGreaterThan(1);
  });
});
