import { notFound, redirect } from 'next/navigation';
import AdminCmsEditor from '../../../components/admin/AdminCmsEditor';
import { createPageMetadata } from '../../../lib/site';
import { createDefaultCmsPageData, migrateCmsDataIfNeeded } from '../../../lib/cms/puck-config';
import { CMS_EDITABLE_PAGES, getCmsEditablePageById } from '../../../lib/cms/page-registry';
import { readCmsPageData } from '../../../lib/cms/storage';
import {
  canAccessAdminSection,
  getAdminRoleForRequest,
  getDefaultAdminPathForRole,
  shouldExposeAdminConsole,
} from '../../../lib/admin-auth';

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

  const role = await getAdminRoleForRequest();
  if (!role) {
    redirect('/admin/login?next=/admin/cms');
  }

  if (!canAccessAdminSection(role, 'cms')) {
    redirect(`${getDefaultAdminPathForRole(role)}?error=forbidden`);
  }

  const selectedPage = getCmsEditablePageById(searchParams?.page ?? '') ?? CMS_EDITABLE_PAGES[0];
  const publishedData = await readCmsPageData(selectedPage.id);
  const editorData = publishedData
    ? migrateCmsDataIfNeeded(selectedPage, publishedData)
    : createDefaultCmsPageData(selectedPage);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin Console</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-950">CMS Publishing</h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Edit one page at a time, preview changes in-context, and publish only when wording and structure are final.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="theme-pill">Draft safely</span>
          <span className="theme-pill">Publish intentionally</span>
          <span className="theme-pill">Rollback via reset</span>
        </div>
      </header>
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
