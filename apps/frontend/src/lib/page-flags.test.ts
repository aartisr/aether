jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('not found');
  }),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: () => undefined,
  })),
}));

const originalEnv = process.env;

async function loadPageFlags({
  env = {},
  cookie,
}: {
  env?: Record<string, string | undefined>;
  cookie?: string;
} = {}) {
  jest.resetModules();
  process.env = { ...originalEnv };
  delete process.env.NEXT_PUBLIC_ENABLED_PAGES;
  delete process.env.NEXT_PUBLIC_DISABLED_PAGES;

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  const headers = await import('next/headers');
  const cookiesMock = headers.cookies as unknown as jest.Mock;
  cookiesMock.mockReturnValue({
    get: () => (cookie ? { value: cookie } : undefined),
  });

  return import('./page-flags');
}

afterAll(() => {
  process.env = originalEnv;
});

describe('page flags', () => {
  it('defaults to Home, About, and Mentors only', async () => {
    const pageFlags = await loadPageFlags();

    expect(pageFlags.getEnabledPages().map((page) => page.id)).toEqual(['home', 'about', 'mentors']);
    expect(pageFlags.isPageEnabled('home')).toBe(true);
    expect(pageFlags.isPageEnabled('about')).toBe(true);
    expect(pageFlags.isPageEnabled('mentors')).toBe(true);
    expect(pageFlags.isPageEnabled('peer-navigator')).toBe(false);
    expect(pageFlags.isPageEnabled('blog')).toBe(false);
    expect(pageFlags.isPageEnabled('privacy')).toBe(false);
  });

  it('lets admin runtime enabled-list cookies turn additional pages on', async () => {
    const baseFlags = await loadPageFlags();
    const cookie = baseFlags.serializePageOverridesCookie({
      enabled: ['about', 'mentors', 'peer-navigator'],
    });
    const pageFlags = await loadPageFlags({ cookie });

    expect(pageFlags.isPageEnabledForRequest('home')).toBe(true);
    expect(pageFlags.isPageEnabledForRequest('about')).toBe(true);
    expect(pageFlags.isPageEnabledForRequest('mentors')).toBe(true);
    expect(pageFlags.isPageEnabledForRequest('peer-navigator')).toBe(true);
    expect(pageFlags.isPageEnabledForRequest('blog')).toBe(false);
  });

  it('uses environment allowlists as explicit page selections', async () => {
    const pageFlags = await loadPageFlags({
      env: {
        NEXT_PUBLIC_ENABLED_PAGES: 'about,mentors,peer-navigator',
      },
    });

    expect(pageFlags.isPageEnabled('home')).toBe(true);
    expect(pageFlags.isPageEnabled('about')).toBe(true);
    expect(pageFlags.isPageEnabled('mentors')).toBe(true);
    expect(pageFlags.isPageEnabled('peer-navigator')).toBe(true);
    expect(pageFlags.isPageEnabled('blog')).toBe(false);
  });

  it('uses environment disabled lists only against default enabled pages', async () => {
    const pageFlags = await loadPageFlags({
      env: {
        NEXT_PUBLIC_DISABLED_PAGES: 'mentors',
      },
    });

    expect(pageFlags.isPageEnabled('home')).toBe(true);
    expect(pageFlags.isPageEnabled('about')).toBe(true);
    expect(pageFlags.isPageEnabled('mentors')).toBe(false);
    expect(pageFlags.isPageEnabled('peer-navigator')).toBe(false);
  });
});
