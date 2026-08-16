/** @jest-environment node */

import { GET } from './route';

describe('health endpoint', () => {
  it('returns a non-cacheable service health response', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'frontend',
        timestamp: expect.any(String),
      }),
    );
  });
});
