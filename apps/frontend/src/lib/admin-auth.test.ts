/** @jest-environment node */

describe('admin role auth', () => {
  const originalEnv = {
    AETHER_ADMIN_SESSION_SECRET: process.env.AETHER_ADMIN_SESSION_SECRET,
    AETHER_ADMIN_ACCESS_KEY: process.env.AETHER_ADMIN_ACCESS_KEY,
    AETHER_ADMIN_ACCESS_KEYS: process.env.AETHER_ADMIN_ACCESS_KEYS,
    AETHER_ADMIN_OWNER_KEYS: process.env.AETHER_ADMIN_OWNER_KEYS,
    AETHER_ADMIN_OPERATOR_KEYS: process.env.AETHER_ADMIN_OPERATOR_KEYS,
    AETHER_ADMIN_REVIEWER_KEYS: process.env.AETHER_ADMIN_REVIEWER_KEYS,
  };

  beforeEach(() => {
    jest.resetModules();
    process.env.AETHER_ADMIN_SESSION_SECRET = 'test-secret';
    process.env.AETHER_ADMIN_ACCESS_KEY = '';
    process.env.AETHER_ADMIN_ACCESS_KEYS = '';
    process.env.AETHER_ADMIN_OWNER_KEYS = 'owner-key';
    process.env.AETHER_ADMIN_OPERATOR_KEYS = 'operator-key';
    process.env.AETHER_ADMIN_REVIEWER_KEYS = 'reviewer-key';
  });

  afterAll(() => {
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key as keyof NodeJS.ProcessEnv];
      } else {
        process.env[key as keyof NodeJS.ProcessEnv] = value;
      }
    });
  });

  it('resolves role from configured keys', async () => {
    const auth = await import('./admin-auth');

    expect(auth.resolveAdminRoleForAccessKey('reviewer-key')).toBe('reviewer');
    expect(auth.resolveAdminRoleForAccessKey('operator-key')).toBe('operator');
    expect(auth.resolveAdminRoleForAccessKey('owner-key')).toBe('owner');
    expect(auth.resolveAdminRoleForAccessKey('unknown')).toBeUndefined();
  });

  it('enforces section and path access by role', async () => {
    const auth = await import('./admin-auth');

    expect(auth.canAccessAdminSection('reviewer', 'audit')).toBe(true);
    expect(auth.canAccessAdminSection('reviewer', 'peers')).toBe(false);
    expect(auth.canAccessAdminSection('operator', 'peers')).toBe(true);
    expect(auth.canAccessAdminSection('operator', 'cms')).toBe(false);
    expect(auth.canAccessAdminSection('owner', 'cms')).toBe(true);

    expect(auth.canAdminRoleAccessPath('reviewer', '/admin/peers/audit')).toBe(true);
    expect(auth.canAdminRoleAccessPath('reviewer', '/admin/peers')).toBe(false);
    expect(auth.canAdminRoleAccessPath('operator', '/admin/peers')).toBe(true);
    expect(auth.canAdminRoleAccessPath('operator', '/admin/page-controls')).toBe(false);
    expect(auth.canAdminRoleAccessPath('owner', '/admin/page-controls')).toBe(true);
  });

  it('creates signed sessions that preserve role', async () => {
    const auth = await import('./admin-auth');

    const token = auth.createAdminSessionToken('operator', 1000);
    expect(auth.verifyAdminSessionToken(token, 2000)).toBe(true);

    const payload = auth.decodeVerifiedAdminSessionToken(token, 2000);
    expect(payload?.role).toBe('operator');
  });
});
