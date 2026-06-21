import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import type { Data } from '@puckeditor/core';
import type { CmsPageId } from './page-registry';

const CMS_CONTENT_DIR_CANDIDATES = [
  path.resolve(process.cwd(), 'content', 'puck-pages'),
  path.resolve(process.cwd(), 'apps', 'frontend', 'content', 'puck-pages'),
  path.resolve(process.cwd(), '../../content', 'puck-pages'),
];

function resolveCmsContentDir(pageId?: CmsPageId): string {
  if (pageId) {
    const fileName = `${pageId}.json`;
    for (const candidate of CMS_CONTENT_DIR_CANDIDATES) {
      if (existsSync(path.join(candidate, fileName))) {
        return candidate;
      }
    }
  }

  for (const candidate of CMS_CONTENT_DIR_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return CMS_CONTENT_DIR_CANDIDATES[0];
}

function getCmsPageFilePath(pageId: CmsPageId): string {
  return path.join(resolveCmsContentDir(pageId), `${pageId}.json`);
}

export async function readCmsPageData(pageId: CmsPageId): Promise<Data | undefined> {
  const filePath = getCmsPageFilePath(pageId);

  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Data;
  } catch {
    return undefined;
  }
}

export async function writeCmsPageData(pageId: CmsPageId, data: Data): Promise<void> {
  const contentDir = resolveCmsContentDir(pageId);
  await mkdir(contentDir, { recursive: true });
  await writeFile(path.join(contentDir, `${pageId}.json`), JSON.stringify(data, null, 2), 'utf-8');
}

export async function deleteCmsPageData(pageId: CmsPageId): Promise<void> {
  try {
    await rm(getCmsPageFilePath(pageId), { force: true });
  } catch {
    // Deleting a missing file should be a no-op.
  }
}
