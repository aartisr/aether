'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Data } from '@puckeditor/core';
import { isAdminAuthenticatedForRequest } from '../../../lib/admin-auth';
import { createDefaultCmsPageData } from '../../../lib/cms/puck-config';
import { getCmsEditablePageById } from '../../../lib/cms/page-registry';
import { deleteCmsPageData, writeCmsPageData } from '../../../lib/cms/storage';

type SaveCmsPageResult = {
  ok: boolean;
  message: string;
};

async function assertAdminSessionOrRedirect(): Promise<void> {
  const authenticated = await isAdminAuthenticatedForRequest();

  if (!authenticated) {
    redirect('/admin/login?next=/admin/cms');
  }
}

export async function saveCmsPageAction(input: { pageId: string; data: Data }): Promise<SaveCmsPageResult> {
  await assertAdminSessionOrRedirect();

  const page = getCmsEditablePageById(input.pageId);

  if (!page) {
    return { ok: false, message: 'Unknown page id.' };
  }

  try {
    await writeCmsPageData(page.id, input.data);
    if (page.id === 'global-shell') {
      revalidatePath('/', 'layout');
    } else {
      revalidatePath(page.path);
    }

    return {
      ok: true,
      message: `Published CMS content for ${page.name}.`,
    };
  } catch {
    return {
      ok: false,
      message: 'Failed to save CMS content.',
    };
  }
}

export async function clearCmsPageAction(input: { pageId: string }): Promise<SaveCmsPageResult> {
  await assertAdminSessionOrRedirect();

  const page = getCmsEditablePageById(input.pageId);

  if (!page) {
    return { ok: false, message: 'Unknown page id.' };
  }

  try {
    await deleteCmsPageData(page.id);
    if (page.id === 'global-shell') {
      revalidatePath('/', 'layout');
    } else {
      revalidatePath(page.path);
    }

    return {
      ok: true,
      message: `Cleared published CMS content for ${page.name}. Route fallback is active.`,
    };
  } catch {
    return {
      ok: false,
      message: 'Failed to clear CMS content.',
    };
  }
}

export async function resetCmsDraftAction(input: { pageId: string }): Promise<SaveCmsPageResult & { data?: unknown }> {
  await assertAdminSessionOrRedirect();

  const page = getCmsEditablePageById(input.pageId);

  if (!page) {
    return { ok: false, message: 'Unknown page id.' };
  }

  return {
    ok: true,
    message: `Reset editor draft scaffold for ${page.name}.`,
    data: createDefaultCmsPageData(page),
  };
}
