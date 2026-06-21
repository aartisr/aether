import { NextRequest, NextResponse } from 'next/server';
import { getCmsEditablePageByPath } from '../../../../lib/cms/page-registry';
import { createParityCmsPageData } from '../../../../lib/cms/parity-defaults';
import { createDefaultCmsPageData, migrateCmsDataIfNeeded } from '../../../../lib/cms/puck-config';
import { readCmsPageData } from '../../../../lib/cms/storage';

export async function GET(request: NextRequest) {
  const requestedPath = request.nextUrl.searchParams.get('path');
  const mode = request.nextUrl.searchParams.get('mode');

  if (!requestedPath) {
    return NextResponse.json({ ok: false, message: 'Missing path query parameter.' }, { status: 400 });
  }

  const page = getCmsEditablePageByPath(requestedPath);

  if (!page) {
    return NextResponse.json({ ok: true, pageId: null, data: null });
  }

  if (mode === 'parity') {
    return NextResponse.json({
      ok: true,
      pageId: page.id,
      data: createParityCmsPageData(page),
    });
  }

  const data = await readCmsPageData(page.id);
  const migratedData = data ? migrateCmsDataIfNeeded(page, data) : page.id === 'home' ? createDefaultCmsPageData(page) : null;

  return NextResponse.json({
    ok: true,
    pageId: page.id,
    data: migratedData,
  });
}
