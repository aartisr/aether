import { generateMockFairnessData } from './FairnessAuditDashboard';

describe('FairnessAuditDashboard mock data', () => {
  it('generates deterministic demo data for server/client hydration', () => {
    const first = generateMockFairnessData();
    const second = generateMockFairnessData();

    expect(first).toEqual(second);
    expect(first.generatedAt).toBe('2026-04-03 16:00 UTC');
  });
});
