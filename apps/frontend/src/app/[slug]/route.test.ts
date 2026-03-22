/** @jest-environment node */

import { GET } from './route';

describe('slug route', () => {
  it('returns a personalized message for the slug', async () => {
    const response = await GET(new Request('http://localhost/test'), {
      params: { slug: 'aarti' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: 'Hello aarti!' });
  });
});
