/** @jest-environment node */

describe('peer recruitment forecasting', () => {
  const originalDriver = process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;

  beforeEach(() => {
    jest.resetModules();
    process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = 'memory';
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

  it('returns forecast data with constrained recommendations', async () => {
    const forecasting = await import('./forecasting');

    const forecast = await forecasting.getRecruitmentForecast({
      horizonDays: 14,
      dailyIncomingMatchDemand: 15,
      maxNewPeerBudget: 5,
      maxTrainingCompletions: 4,
      maxVerifications: 4,
    });

    expect(forecast.horizonDays).toBe(14);
    expect(forecast.demand.projectedDemand).toBe(210);
    expect(forecast.supply.projectedOpenSlots).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(forecast.recommendedPlan)).toBe(true);
  });
});
