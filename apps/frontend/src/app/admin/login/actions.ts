'use server';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE_NAME,
  canAdminRoleAccessPath,
  createAdminSessionToken,
  getDefaultAdminPathForRole,
  getAdminSessionMaxAgeSeconds,
  isAdminAccessConfigured,
  resolveAdminRoleForAccessKey,
  shouldExposeAdminConsole,
} from '../../../lib/admin-auth';

function sanitizeNextPath(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/admin/page-controls';
  }

  if (nextPath.startsWith('/admin/login')) {
    return '/admin/page-controls';
  }

  return nextPath;
}

export async function loginAdminAction(formData: FormData) {
  if (!shouldExposeAdminConsole() || !isAdminAccessConfigured()) {
    notFound();
  }

  const accessKey = String(formData.get('accessKey') ?? '').trim();
  const nextPath = sanitizeNextPath(String(formData.get('next') ?? '/admin/page-controls'));

  const role = resolveAdminRoleForAccessKey(accessKey);

  if (!role) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const safeNextPath = canAdminRoleAccessPath(role, nextPath) ? nextPath : getDefaultAdminPathForRole(role);

  const token = createAdminSessionToken(role);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    path: '/admin',
    maxAge: getAdminSessionMaxAgeSeconds(),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  redirect(safeNextPath);
}
