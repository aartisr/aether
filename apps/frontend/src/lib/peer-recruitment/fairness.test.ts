/** @jest-environment node */

describe('recruitment fairness snapshot', () => {
  const originalDriver = process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;

  beforeEach(() => {
    process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = 'memory';
    jest.resetModules();
  });

  afterEach(async () => {
    if (originalDriver === undefined) {
      delete process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;
    } else {
      process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = originalDriver;
    }

    const persistence = await import('./persistence');
    persistence.__resetPeerRecruitmentPersistenceForTests();
  });

  it('builds non-empty fairness metrics and policy from recruitment records', async () => {
    const fairness = await import('./fairness');
    const snapshot = await fairness.getRecruitmentFairnessSnapshot();

    expect(snapshot.metrics.length).toBeGreaterThan(0);
    expect(snapshot.policy.version).toBe('recruitment-v1');
    expect(snapshot.totalCycles).toBeGreaterThanOrEqual(1);
    expect(snapshot.metrics.every((item) => item.populationShare >= 0)).toBe(true);
  });
});
