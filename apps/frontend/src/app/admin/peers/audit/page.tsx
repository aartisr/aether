import { notFound, redirect } from 'next/navigation';
import {
  canAccessAdminSection,
  getAdminRoleForRequest,
  getDefaultAdminPathForRole,
  shouldExposeAdminConsole,
} from '../../../../lib/admin-auth';
import { listRecruitmentAuditEvents } from '../../../../lib/peer-recruitment/store';
import { createPageMetadata } from '../../../../lib/site';

export const metadata = createPageMetadata({
  title: 'Peer Recruitment Audit',
  description: 'Review lifecycle and incident audit events with filter and export controls.',
  path: '/admin/peers/audit',
  keywords: ['peer audit', 'recruitment audit', 'lifecycle events'],
  index: false,
});

export default async function AdminPeerAuditPage({
  searchParams,
}: {
  searchParams?: { eventType?: string; peerId?: string; actorId?: string };
}) {
  if (!shouldExposeAdminConsole()) {
    notFound();
  }

  const role = await getAdminRoleForRequest();
  if (!role) {
    redirect('/admin/login?next=/admin/peers/audit');
  }

  if (!canAccessAdminSection(role, 'audit')) {
    redirect(`${getDefaultAdminPathForRole(role)}?error=forbidden`);
  }

  const eventType = searchParams?.eventType?.trim() || undefined;
  const peerId = searchParams?.peerId?.trim() || undefined;
  const actorId = searchParams?.actorId?.trim() || undefined;
  const events = await listRecruitmentAuditEvents({ eventType: eventType as never, peerId, actorId });

  const query = new URLSearchParams();
  if (eventType) query.set('eventType', eventType);
  if (peerId) query.set('peerId', peerId);
  if (actorId) query.set('actorId', actorId);
  const exportHref = `/api/peer-recruitment/audit/export${query.toString() ? `?${query.toString()}` : ''}`;

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft md:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-extrabold text-slate-900">Peer Recruitment Audit</h1>
        <p className="text-sm leading-6 text-slate-700">
          Filter lifecycle and incident events. Export current filtered results as CSV.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href="/admin/peers" className="theme-pill no-underline hover:no-underline">Peer Directory</a>
          <a href={exportHref} className="theme-pill no-underline hover:no-underline">Export CSV</a>
        </div>
      </header>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <input
          name="eventType"
          defaultValue={eventType}
          placeholder="eventType"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <input
          name="peerId"
          defaultValue={peerId}
          placeholder="peerId"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <input
          name="actorId"
          defaultValue={actorId}
          placeholder="actorId"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Apply Filters
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.08em] text-slate-600">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Peer</th>
              <th className="px-4 py-3">State Change</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.eventId}>
                <td className="px-4 py-3 text-xs text-slate-600">{event.timestamp}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{event.eventType}</td>
                <td className="px-4 py-3 text-slate-700">{event.peerId}</td>
                <td className="px-4 py-3 text-slate-700">{event.previousState} → {event.nextState}</td>
                <td className="px-4 py-3 text-slate-700">{event.actorId}</td>
                <td className="px-4 py-3 text-slate-700">{event.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
