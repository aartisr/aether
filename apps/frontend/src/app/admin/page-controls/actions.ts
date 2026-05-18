'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE_NAME,
  isAdminAuthenticatedForRequest,
} from '../../../lib/admin-auth';
import {
  DEFAULT_ENABLED_PAGE_IDS,
  type AppPageId,
  getAllPages,
  PAGE_FLAGS_COOKIE_NAME,
  serializePageOverridesCookie,
} from '../../../lib/page-flags';

const nonHomePageIds = new Set<AppPageId>(
  getAllPages()
    .filter((page) => page.id !== 'home')
    .map((page) => page.id),
);

type TogglePreset = 'default' | 'all' | 'core' | 'journal';

const togglePresets: Record<TogglePreset, AppPageId[]> = {
  default: DEFAULT_ENABLED_PAGE_IDS.filter((pageId) => pageId !== 'home'),
  all: [...nonHomePageIds],
  core: ['resilience-pathway', 'echo', 'peer-navigator', 'privacy', 'about', 'mentors'],
  journal: ['blog', 'about', 'mentors', 'privacy', 'accessibility'],
};

async function assertAdminSessionOrRedirect(): Promise<void> {
  const authenticated = await isAdminAuthenticatedForRequest();
  if (!authenticated) {
    redirect('/admin/login?next=/admin/page-controls');
  }
}

async function persistEnabledPages(enabled: AppPageId[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PAGE_FLAGS_COOKIE_NAME, serializePageOverridesCookie({ enabled, disabled: [] }), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });
}

export async function savePageFlagsAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const selectedIds = formData.getAll('enabledPages');

  const enabled = selectedIds.filter((value): value is AppPageId => {
    return typeof value === 'string' && nonHomePageIds.has(value as AppPageId);
  });

  await persistEnabledPages(enabled);

  redirect('/admin/page-controls?saved=1');
}

export async function applyPresetAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const presetValue = formData.get('preset');
  const preset = typeof presetValue === 'string' ? (presetValue as TogglePreset) : undefined;

  if (!preset || !(preset in togglePresets)) {
    redirect('/admin/page-controls?error=invalid-preset');
  }

  await persistEnabledPages(togglePresets[preset]);
  redirect(`/admin/page-controls?preset=${preset}`);
}

export async function resetPageFlagsAction() {
  await assertAdminSessionOrRedirect();

  const cookieStore = await cookies();
  cookieStore.delete(PAGE_FLAGS_COOKIE_NAME);

  redirect('/admin/page-controls?reset=1');
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(PAGE_FLAGS_COOKIE_NAME);
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, '', {
    path: '/admin',
    maxAge: 0,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  redirect('/admin/login?logout=1');
}
