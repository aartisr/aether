import { notFound, redirect } from 'next/navigation';
import {
  activatePeerAction,
  createPeerRecordAction,
  deletePeerRecordAction,
  openIncidentAction,
  pausePeerAction,
  resolveIncidentAction,
  suspendPeerAction,
  updatePeerRecordAction,
  updateScreeningAction,
  updateTrainingAction,
  updateVerificationAction,
} from './actions';
import {
  canAccessAdminSection,
  getAdminRoleForRequest,
  getDefaultAdminPathForRole,
  shouldExposeAdminConsole,
} from '../../../lib/admin-auth';
import { getRecruitmentForecast } from '../../../lib/peer-recruitment/forecasting';
import { listPeerIncidentCases, listRecruitmentPeers } from '../../../lib/peer-recruitment/store';
import { createPageMetadata } from '../../../lib/site';

export const metadata = createPageMetadata({
  title: 'Admin Peer Directory',
  description: 'Manage peer lifecycle state, activation, pause controls, and recruitment readiness.',
  path: '/admin/peers',
  keywords: ['admin peers', 'peer lifecycle', 'peer recruitment'],
  index: false,
});

const stateBadgeClass: Record<string, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  paused: 'border-amber-200 bg-amber-50 text-amber-900',
  verified: 'border-sky-200 bg-sky-50 text-sky-900',
};

export default async function AdminPeersPage({
  searchParams,
}: {
  searchParams?: { saved?: string; error?: string };
}) {
  if (!shouldExposeAdminConsole()) {
    notFound();
  }

  const role = await getAdminRoleForRequest();
  if (!role) {
    redirect('/admin/login?next=/admin/peers');
  }

  if (!canAccessAdminSection(role, 'peers')) {
    redirect(`${getDefaultAdminPathForRole(role)}?error=forbidden`);
  }

  const peers = await listRecruitmentPeers();
  const openIncidents = await listPeerIncidentCases({ status: 'open' });
  const forecast = await getRecruitmentForecast();

  const screeningQueue = peers.filter((peer) => peer.screeningStatus !== 'passed');
  const trainingQueue = peers.filter((peer) => peer.screeningStatus === 'passed' && peer.trainingStatus !== 'complete');
  const verificationQueue = peers.filter(
    (peer) => peer.screeningStatus === 'passed' && peer.trainingStatus === 'complete' && peer.verificationStatus !== 'verified'
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-soft md:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-extrabold text-slate-900">Peer Directory</h1>
        <p className="text-sm leading-6 text-slate-700">
          Manage peer lifecycle transitions with invariant checks. Activation requires screening passed, training complete,
          and verification complete.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href="/admin/page-controls" className="theme-pill no-underline hover:no-underline">Page Controls</a>
          <a href="/admin/cms" className="theme-pill no-underline hover:no-underline">CMS Publishing</a>
          <a href="/admin/feedback" className="theme-pill no-underline hover:no-underline">Feedback Review</a>
          <a href="/admin/peers/audit" className="theme-pill no-underline hover:no-underline">Audit Review</a>
        </div>
      </header>

      {searchParams?.saved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Peer state updated: {searchParams.saved}.
        </div>
      ) : null}
      {searchParams?.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          Action failed: {searchParams.error}.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Queue summary">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Screening queue</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{screeningQueue.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Training queue</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{trainingQueue.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Verification queue</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{verificationQueue.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Open incidents</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{openIncidents.length}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Capacity Forecast and Optimizer</h2>
        <p className="mt-1 text-sm text-slate-700">
          {forecast.horizonDays}-day demand projection: {forecast.demand.projectedDemand} matches.
          Projected capacity: {forecast.supply.projectedOpenSlots} open slots.
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          {forecast.gap.projectedShortfall > 0
            ? `Projected shortfall: ${forecast.gap.projectedShortfall} matches.`
            : `Projected surplus: ${forecast.gap.projectedSurplus} matches.`}
        </p>

        {forecast.recommendedPlan.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {forecast.recommendedPlan.map((action) => (
              <li key={action.action} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                <p className="font-semibold">
                  {action.action.replaceAll('_', ' ')}: {action.count} (capacity +{action.expectedCapacityGain})
                </p>
                <p className="mt-1 text-xs text-slate-600">{action.rationale}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-emerald-800">No optimizer interventions needed for current horizon.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Add Peer Record</h2>
        <form action={createPeerRecordAction} className="mt-3 grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="background" required placeholder="Background" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="pronouns" required placeholder="Pronouns" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input
            name="maxActiveMatches"
            type="number"
            min={1}
            max={50}
            defaultValue={3}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="responseSlaHours"
            type="number"
            min={1}
            max={240}
            defaultValue={24}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select name="source" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="other">other</option>
            <option value="referral">referral</option>
            <option value="campaign">campaign</option>
            <option value="event">event</option>
            <option value="seed">seed</option>
          </select>
          <select name="roleIntent" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="navigator">navigator</option>
            <option value="seeker">seeker</option>
            <option value="both">both</option>
          </select>
          <input
            name="goals"
            required
            placeholder="Goals (comma separated)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Modalities</p>
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="modalities" value="chat" defaultChecked />chat</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="modalities" value="phone" />phone</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" name="modalities" value="video" defaultChecked />video</label>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 md:col-span-2"
          >
            Create Peer
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Open Incident Cases</h2>
        {openIncidents.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No open incidents.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {openIncidents.map((incident) => (
              <div key={incident.caseId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-bold text-slate-900">
                  {incident.caseId} · {incident.peerId} · {incident.severity.toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-slate-700">{incident.summary}</p>
                <form action={resolveIncidentAction} className="mt-2 flex flex-wrap gap-2">
                  <input type="hidden" name="caseId" value={incident.caseId} />
                  <input type="hidden" name="restoreToPaused" value="true" />
                  <input
                    name="resolutionNote"
                    required
                    className="min-w-[220px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900"
                    placeholder="Resolution note"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    Resolve + Restore
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-[0.08em] text-slate-600">
            <tr>
              <th className="px-4 py-3">Peer</th>
              <th className="px-4 py-3">Lifecycle</th>
              <th className="px-4 py-3">Readiness</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {peers.map((peer) => {
              const badgeClass = stateBadgeClass[peer.lifecycleState] ?? 'border-slate-200 bg-slate-50 text-slate-700';
              return (
                <tr key={peer.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{peer.name}</p>
                    <p className="text-xs text-slate-600">{peer.background} · {peer.pronouns}</p>
                    <p className="mt-1 text-xs text-slate-500">{peer.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${badgeClass}`}>
                      {peer.lifecycleState}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs leading-6 text-slate-700">
                    <p>screening: <strong>{peer.screeningStatus}</strong></p>
                    <p>training: <strong>{peer.trainingStatus}</strong></p>
                    <p>verification: <strong>{peer.verificationStatus}</strong></p>
                  </td>
                  <td className="px-4 py-3 text-xs leading-6 text-slate-700">
                    <p>{peer.currentActiveMatches}/{peer.maxActiveMatches} active</p>
                    <p>SLA: {peer.responseSlaHours}h</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={updateScreeningAction}>
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="screeningStatus" value="passed" />
                        <input type="hidden" name="reason" value="screening approved" />
                        <button
                          type="submit"
                          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                        >
                          Screening Pass
                        </button>
                      </form>
                      <form action={updateTrainingAction}>
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="trainingStatus" value="complete" />
                        <input type="hidden" name="reason" value="training completed" />
                        <button
                          type="submit"
                          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                        >
                          Training Complete
                        </button>
                      </form>
                      <form action={updateVerificationAction}>
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="verificationStatus" value="verified" />
                        <input type="hidden" name="reason" value="verification approved" />
                        <button
                          type="submit"
                          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                        >
                          Verify
                        </button>
                      </form>
                      <form action={activatePeerAction}>
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="reason" value="manual admin activation" />
                        <button
                          type="submit"
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                        >
                          Activate
                        </button>
                      </form>
                      <form action={pausePeerAction}>
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="reason" value="manual admin pause" />
                        <button
                          type="submit"
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                        >
                          Pause
                        </button>
                      </form>
                      <form action={suspendPeerAction}>
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="reason" value="manual admin suspension" />
                        <button
                          type="submit"
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
                        >
                          Suspend
                        </button>
                      </form>
                      <form action={openIncidentAction} className="flex items-center gap-2">
                        <input type="hidden" name="peerId" value={peer.id} />
                        <input type="hidden" name="severity" value="p2" />
                        <input type="hidden" name="summary" value="Admin incident hold" />
                        <button
                          type="submit"
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
                        >
                          Open Incident
                        </button>
                      </form>
                      <details className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-700">Edit record</summary>
                        <form action={updatePeerRecordAction} className="mt-2 grid gap-2 sm:grid-cols-2">
                          <input type="hidden" name="peerId" value={peer.id} />
                          <input name="name" defaultValue={peer.name} className="rounded border border-slate-300 px-2 py-1 text-xs" />
                          <input name="background" defaultValue={peer.background} className="rounded border border-slate-300 px-2 py-1 text-xs" />
                          <input name="pronouns" defaultValue={peer.pronouns} className="rounded border border-slate-300 px-2 py-1 text-xs" />
                          <input
                            name="goals"
                            defaultValue={peer.goals.join(', ')}
                            className="rounded border border-slate-300 px-2 py-1 text-xs sm:col-span-2"
                          />
                          <div className="sm:col-span-2 flex flex-wrap gap-3 text-xs">
                            <label className="inline-flex items-center gap-1">
                              <input type="checkbox" name="modalities" value="chat" defaultChecked={peer.modalities.includes('chat')} />chat
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input type="checkbox" name="modalities" value="phone" defaultChecked={peer.modalities.includes('phone')} />phone
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input type="checkbox" name="modalities" value="video" defaultChecked={peer.modalities.includes('video')} />video
                            </label>
                          </div>
                          <input
                            name="maxActiveMatches"
                            type="number"
                            min={1}
                            max={50}
                            defaultValue={peer.maxActiveMatches}
                            className="rounded border border-slate-300 px-2 py-1 text-xs"
                          />
                          <input
                            name="responseSlaHours"
                            type="number"
                            min={1}
                            max={240}
                            defaultValue={peer.responseSlaHours}
                            className="rounded border border-slate-300 px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100 sm:col-span-2"
                          >
                            Save Peer Record
                          </button>
                        </form>
                        <form action={deletePeerRecordAction} className="mt-2">
                          <input type="hidden" name="peerId" value={peer.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                          >
                            Delete Peer
                          </button>
                        </form>
                      </details>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
