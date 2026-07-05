import { notFound, redirect } from 'next/navigation';
import {
  canAccessAdminSection,
  getAdminRoleForRequest,
  getDefaultAdminPathForRole,
  shouldExposeAdminConsole,
} from '../../../lib/admin-auth';
import { getFeedbackStoreLocation, listFeedbackSubmissions } from '../../../lib/feedback/store';
import { createPageMetadata } from '../../../lib/site';

export const metadata = createPageMetadata({
  title: 'Feedback Review',
  description: 'Review structured product feedback submitted through Aether.',
  path: '/admin/feedback',
  keywords: ['feedback review', 'admin feedback', 'product triage'],
  index: false,
});

function formatDate(input: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(input));
}

export default async function AdminFeedbackPage() {
  if (!shouldExposeAdminConsole()) {
    notFound();
  }

  const role = await getAdminRoleForRequest();
  if (!role) {
    redirect('/admin/login?next=/admin/feedback');
  }

  if (!canAccessAdminSection(role, 'feedback')) {
    redirect(`${getDefaultAdminPathForRole(role)}?error=forbidden`);
  }

  const submissions = await listFeedbackSubmissions(200);
  const impactCounts = submissions.reduce<Record<string, number>>((acc, submission) => {
    acc[submission.impact] = (acc[submission.impact] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft md:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-extrabold text-slate-900">Feedback Review</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-700">
          Review structured feedback signals from the public Feedback Observatory. Submissions are stored as JSONL so
          they can be exported, imported into an issue tracker, or migrated to a database later.
        </p>
        <p className="break-all text-xs text-slate-500">Store: {getFeedbackStoreLocation()}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href="#feedback-summary" className="theme-pill no-underline hover:no-underline">Summary</a>
          <a href="#feedback-list" className="theme-pill no-underline hover:no-underline">Submissions</a>
        </div>
      </header>

      <section id="feedback-summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 scroll-mt-24" aria-label="Feedback summary">
        {[
          ['Total', submissions.length],
          ['Trust/safety', impactCounts.trust ?? 0],
          ['Blocking', impactCounts.blocking ?? 0],
          ['Noticeable', impactCounts.noticeable ?? 0],
          ['Tiny', impactCounts.tiny ?? 0],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-950">{value}</p>
            <h2 className="mt-1 text-xs font-black uppercase tracking-[0.1em] text-slate-600">{label}</h2>
          </article>
        ))}
      </section>

      {submissions.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-bold text-slate-900">No feedback yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Once someone submits the feedback form, their signal will appear here with triage-ready fields.
          </p>
        </section>
      ) : (
        <div id="feedback-list" className="grid gap-4 scroll-mt-24">
          {submissions.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="break-all text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                    {submission.id}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-950">{submission.surface}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {submission.type} · {submission.impact} · {formatDate(submission.createdAt)}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-emerald-800">
                  {submission.status}
                </span>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.1em] text-slate-700">
                  Show triage details
                </summary>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Issue</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{submission.issue}</p>
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Requested fix</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{submission.requestedFix}</p>
                  </section>
                </div>

                {submission.wantsAddition ? (
                  <section className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.1em] text-violet-800">Feature addition</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{submission.addition}</p>
                    {submission.audience || submission.importance ? (
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {submission.audience ? `Audience: ${submission.audience}` : ''}
                        {submission.audience && submission.importance ? ' · ' : ''}
                        {submission.importance ? `Why: ${submission.importance}` : ''}
                      </p>
                    ) : null}
                  </section>
                ) : null}
              </details>

              <footer className="mt-4 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                <span>Follow-up: {submission.allowFollowUp ? 'allowed' : 'not allowed'}</span>
                <span className="break-all">Contact: {submission.contact || 'none'}</span>
                <span className="break-all">Fingerprint: {submission.fingerprint}</span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
