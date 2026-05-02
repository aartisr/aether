import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

type AdminSessionPayload = {
  iat: number;
  exp: number;
  nonce: string;
};

export const ADMIN_SESSION_COOKIE_NAME = 'aether_admin_session';

const sessionDurationMinutes = Number(process.env.AETHER_ADMIN_SESSION_TTL_MINUTES ?? '480');

function getConfiguredAdminKeys(): string[] {
  const candidates = [
    process.env.AETHER_ADMIN_ACCESS_KEY,
    ...(process.env.AETHER_ADMIN_ACCESS_KEYS ?? '').split(','),
  ];

  return candidates
    .map((value) => value?.trim() ?? '')
    .filter((value) => value.length > 0);
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
      parsed.nonce.length < 8
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

export function validateAdminAccessKey(input: string): boolean {
  const value = input.trim();
  if (!value) {
    return false;
  }

  const keys = getConfiguredAdminKeys();
  if (keys.length === 0) {
    return false;
  }

  return keys.some((candidate) => timingSafeMatch(candidate, value));
}

export function createAdminSessionToken(now = Date.now()): string {
  const durationMs = Math.max(5, sessionDurationMinutes) * 60 * 1000;
  const payload: AdminSessionPayload = {
    iat: now,
    exp: now + durationMs,
    nonce: randomBytes(16).toString('base64url'),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!timingSafeMatch(expectedSignature, signature)) {
    return false;
  }

  const payload = decodeSessionPayload(encodedPayload);
  if (!payload) {
    return false;
  }

  return payload.exp > now;
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

export function getAdminSessionMaxAgeSeconds(): number {
  return Math.max(5, sessionDurationMinutes) * 60;
}
