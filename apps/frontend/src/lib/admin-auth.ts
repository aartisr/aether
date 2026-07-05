import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export type AdminRole = 'reviewer' | 'operator' | 'owner';

export type AdminSection = 'page-controls' | 'cms' | 'peers' | 'audit' | 'feedback';

type AdminSessionPayload = {
  iat: number;
  exp: number;
  nonce: string;
  role: AdminRole;
};

export const ADMIN_SESSION_COOKIE_NAME = 'aether_admin_session';

const sessionDurationMinutes = Number(process.env.AETHER_ADMIN_SESSION_TTL_MINUTES ?? '480');

function parseKeyList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function getConfiguredAdminKeysByRole(): Record<AdminRole, string[]> {
  const legacyOwnerKeys = [process.env.AETHER_ADMIN_ACCESS_KEY?.trim() ?? '', ...parseKeyList(process.env.AETHER_ADMIN_ACCESS_KEYS)]
    .filter((value) => value.length > 0);

  const ownerKeys = [...legacyOwnerKeys, ...parseKeyList(process.env.AETHER_ADMIN_OWNER_KEYS)];
  const operatorKeys = parseKeyList(process.env.AETHER_ADMIN_OPERATOR_KEYS);
  const reviewerKeys = parseKeyList(process.env.AETHER_ADMIN_REVIEWER_KEYS);

  return {
    reviewer: reviewerKeys,
    operator: operatorKeys,
    owner: ownerKeys,
  };
}

function getConfiguredAdminKeys(): string[] {
  const byRole = getConfiguredAdminKeysByRole();
  return [...byRole.owner, ...byRole.operator, ...byRole.reviewer];
}

function getSessionSigningSecret(): string {
  const explicitSecret = process.env.AETHER_ADMIN_SESSION_SECRET?.trim();
  if (explicitSecret) {
    return explicitSecret;
  }

  return getConfiguredAdminKeys().join('|');
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSessionSigningSecret()).update(encodedPayload).digest('base64url');
}

function timingSafeMatch(candidate: string, provided: string): boolean {
  const candidateDigest = createHmac('sha256', 'aether-admin-key-compare').update(candidate).digest();
  const providedDigest = createHmac('sha256', 'aether-admin-key-compare').update(provided).digest();

  return timingSafeEqual(candidateDigest, providedDigest);
}

function decodeSessionPayload(encodedPayload: string): AdminSessionPayload | undefined {
  try {
    const json = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const parsed = JSON.parse(json) as AdminSessionPayload;

    if (
      typeof parsed.iat !== 'number' ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.nonce !== 'string' ||
      parsed.nonce.length < 8 ||
      !isAdminRole(parsed.role)
    ) {
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
}

export function shouldExposeAdminConsole(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return process.env.AETHER_ENABLE_ADMIN_PAGE === 'true';
}

export function isAdminAccessConfigured(): boolean {
  return getConfiguredAdminKeys().length > 0;
}

function isAdminRole(value: unknown): value is AdminRole {
  return value === 'reviewer' || value === 'operator' || value === 'owner';
}

export function resolveAdminRoleForAccessKey(input: string): AdminRole | undefined {
  const value = input.trim();
  if (!value) {
    return undefined;
  }

  const byRole = getConfiguredAdminKeysByRole();

  if (byRole.owner.some((candidate) => timingSafeMatch(candidate, value))) {
    return 'owner';
  }

  if (byRole.operator.some((candidate) => timingSafeMatch(candidate, value))) {
    return 'operator';
  }

  if (byRole.reviewer.some((candidate) => timingSafeMatch(candidate, value))) {
    return 'reviewer';
  }

  return undefined;
}

export function validateAdminAccessKey(input: string): boolean {
  return Boolean(resolveAdminRoleForAccessKey(input));
}

export function createAdminSessionToken(role: AdminRole, now = Date.now()): string {
  const durationMs = Math.max(5, sessionDurationMinutes) * 60 * 1000;
  const payload: AdminSessionPayload = {
    iat: now,
    exp: now + durationMs,
    nonce: randomBytes(16).toString('base64url'),
    role,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function decodeVerifiedAdminSessionToken(token: string | undefined, now = Date.now()): AdminSessionPayload | undefined {
  if (!token) {
    return undefined;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return undefined;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!timingSafeMatch(expectedSignature, signature)) {
    return undefined;
  }

  const payload = decodeSessionPayload(encodedPayload);
  if (!payload) {
    return undefined;
  }

  if (payload.exp <= now) {
    return undefined;
  }

  return payload;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()): boolean {
  return Boolean(decodeVerifiedAdminSessionToken(token, now));
}

export async function isAdminAuthenticatedForRequest(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}

export async function getAdminRoleForRequest(): Promise<AdminRole | undefined> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const payload = decodeVerifiedAdminSessionToken(token);
    return payload?.role;
  } catch {
    return undefined;
  }
}

export function canAccessAdminSection(role: AdminRole, section: AdminSection): boolean {
  switch (role) {
    case 'owner':
      return true;
    case 'operator':
      return section === 'peers' || section === 'audit' || section === 'feedback';
    case 'reviewer':
      return section === 'audit' || section === 'feedback';
    default:
      return false;
  }
}

export function getDefaultAdminPathForRole(role: AdminRole): string {
  switch (role) {
    case 'owner':
      return '/admin/page-controls';
    case 'operator':
      return '/admin/peers';
    case 'reviewer':
      return '/admin/peers/audit';
    default:
      return '/admin/login';
  }
}

export function canAdminRoleAccessPath(role: AdminRole, path: string): boolean {
  if (!path.startsWith('/admin')) {
    return false;
  }

  if (path === '/admin/login') {
    return true;
  }

  if (path.startsWith('/admin/page-controls')) {
    return canAccessAdminSection(role, 'page-controls');
  }

  if (path.startsWith('/admin/cms')) {
    return canAccessAdminSection(role, 'cms');
  }

  if (path.startsWith('/admin/peers/audit')) {
    return canAccessAdminSection(role, 'audit');
  }

  if (path.startsWith('/admin/peers')) {
    return canAccessAdminSection(role, 'peers');
  }

  if (path.startsWith('/admin/feedback')) {
    return canAccessAdminSection(role, 'feedback');
  }

  return role === 'owner';
}

export function getAdminSessionMaxAgeSeconds(): number {
  return Math.max(5, sessionDurationMinutes) * 60;
}
