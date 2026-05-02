'use server';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionMaxAgeSeconds,
  isAdminAccessConfigured,
  shouldExposeAdminConsole,
  validateAdminAccessKey,
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

  if (!validateAdminAccessKey(accessKey)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const token = createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    path: '/admin',
    maxAge: getAdminSessionMaxAgeSeconds(),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  redirect(nextPath);
}
