/** @jest-environment node */

describe('peer recruitment persistence factory', () => {
  const originalDriver = process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;
  const originalConnection = process.env.PEER_RECRUITMENT_PG_CONNECTION_STRING;

  afterEach(async () => {
    if (originalDriver === undefined) {
      delete process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;
    } else {
      process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = originalDriver;
    }

    if (originalConnection === undefined) {
      delete process.env.PEER_RECRUITMENT_PG_CONNECTION_STRING;
    } else {
      process.env.PEER_RECRUITMENT_PG_CONNECTION_STRING = originalConnection;
    }

    const persistence = await import('./persistence');
    const postgres = await import('./persistence-postgres');
    persistence.__resetPeerRecruitmentPersistenceForTests();
    postgres.__resetPostgresPersistenceForTests();
  });

  it('uses memory driver when configured', async () => {
    process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = 'memory';
    const persistence = await import('./persistence');
    persistence.__resetPeerRecruitmentPersistenceForTests();

    const driver = persistence.getPeerRecruitmentPersistence();
    const peers = await driver.readPeers();

    expect(Array.isArray(peers)).toBe(true);
    expect(peers).toHaveLength(0);
  });

  it('selects postgres driver and fails with missing connection string when used', async () => {
    process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = 'postgres';
    delete process.env.PEER_RECRUITMENT_PG_CONNECTION_STRING;
    const persistence = await import('./persistence');
    persistence.__resetPeerRecruitmentPersistenceForTests();

    const driver = persistence.getPeerRecruitmentPersistence();

    await expect(driver.readPeers()).rejects.toThrow('PEER_RECRUITMENT_PG_CONNECTION_STRING is required');
  });
});
