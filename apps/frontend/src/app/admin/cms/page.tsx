import { notFound, redirect } from 'next/navigation';
import AdminCmsEditor from '../../../components/admin/AdminCmsEditor';
import { createPageMetadata } from '../../../lib/site';
import { createDefaultCmsPageData, migrateCmsDataIfNeeded } from '../../../lib/cms/puck-config';
import { CMS_EDITABLE_PAGES, getCmsEditablePageById } from '../../../lib/cms/page-registry';
import { readCmsPageData } from '../../../lib/cms/storage';
import { isAdminAuthenticatedForRequest, shouldExposeAdminConsole } from '../../../lib/admin-auth';

export const metadata = createPageMetadata({
  title: 'Admin CMS',
  description: 'Edit and publish all public Aether pages with Puck.',
  path: '/admin/cms',
  keywords: ['admin cms', 'puck editor', 'page editing'],
  index: false,
});

export default async function AdminCmsPage({ searchParams }: { searchParams?: { page?: string } }) {
  if (!shouldExposeAdminConsole()) {
    notFound();
  }

  const authenticated = await isAdminAuthenticatedForRequest();

  if (!authenticated) {
    redirect('/admin/login?next=/admin/cms');
  }

  const selectedPage = getCmsEditablePageById(searchParams?.page ?? '') ?? CMS_EDITABLE_PAGES[0];
  const publishedData = await readCmsPageData(selectedPage.id);
  const editorData = publishedData
    ? migrateCmsDataIfNeeded(selectedPage, publishedData)
    : createDefaultCmsPageData(selectedPage);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <AdminCmsEditor
        key={selectedPage.id}
        pages={CMS_EDITABLE_PAGES}
        selectedPage={selectedPage}
        initialData={editorData}
        hasPublishedData={Boolean(publishedData)}
      />
    </section>
  );
}
