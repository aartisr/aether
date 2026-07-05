"use client";

import React, { useState } from 'react';

import { PageBackdrop, PageContainer, PageHero, SurfaceCard } from '../../components/page/PagePrimitives';
import { HubAction, HubPanel, hubInputClass } from '../../components/resilience/ResilienceHubPrimitives';
import {
  createPeerNavigatorMatcher,
  peerNavigatorBackgrounds,
  peerNavigatorGoals,
  peerNavigatorModalities,
  runPeerNavigatorMatchRequest,
  type PeerNavigatorMatchResult,
  type PeerNavigatorMetrics,
} from '../../lib/peer-navigator-demo';

const matcher = createPeerNavigatorMatcher();

const matchingSteps = [
  {
    title: 'Signal',
    description: 'Choose one broad context area. The demo avoids names, contact details, and sensitive free text.',
  },
  {
    title: 'Rank',
    description: 'The matcher scores fit through staged compatibility, safety, and fairness-aware adjustments.',
  },
  {
    title: 'Review',
    description: 'A primary and backup match are shown with score progression for auditability.',
  },
];

const firstRunTips = [
  'Pick the broadest context that feels true right now.',
  'Treat the first result as a starting point, not a label.',
  'Use backup match if the primary fit feels off.',
];

export default function PeerNavigator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>(peerNavigatorGoals[0]);
  const [modality, setModality] = useState<(typeof peerNavigatorModalities)[number]>(peerNavigatorModalities[0]);
  const [urgencyBand, setUrgencyBand] = useState<'not_urgent' | 'soon' | 'high_concern' | 'immediate_danger'>('not_urgent');
  const [matches, setMatches] = useState<PeerNavigatorMatchResult[]>([]);
  const [metrics, setMetrics] = useState<PeerNavigatorMetrics | null>(null);
  const [showMetricsDetail, setShowMetricsDetail] = useState(false);
  const [triage, setTriage] = useState<{ message: string; actionLabel: string; actionHref: string } | null>(null);

  const handleMatch = () => {
    if (!selected) return;

    const result = runPeerNavigatorMatchRequest(
      {
        background: selected,
        goal,
        modality,
        urgencyBand,
      },
      matcher,
    );
    setMetrics(result.metrics);
    setMatches(result.matches);
    setTriage(result.triage ?? null);
  };

  return (
    <PageBackdrop>
      <PageContainer className="max-w-6xl">
        <PageHero
          kicker="Belonging Support"
          title="Peer-Navigator Network"
          description="Connect with peers who share relevant lived context and build support pathways in a privacy-aware matching flow."
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <SurfaceCard className="border-emerald-100 bg-white">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-800">Matching workspace</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Find a relevant peer pathway</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Choose a broad context, then review how the system arrives at a primary and backup match. This demo is
              transparent by design so teams can inspect matching behavior before any real deployment.
            </p>

            <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); handleMatch(); }}>
              <div>
                <label htmlFor="background" className="block text-sm font-bold text-slate-900">
                  Background or support context
                </label>
                <select
                  id="background"
                  className={`${hubInputClass('belong')} max-w-md`}
                  value={selected || ''}
                  onChange={(event) => setSelected(event.target.value)}
                  required
                  aria-label="Select your background or identity"
                >
                  <option value="" disabled>Select one context...</option>
                  {peerNavigatorBackgrounds.map((background) => (
                    <option key={background} value={background}>{background}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="goal" className="block text-sm font-bold text-slate-900">Support goal</label>
                  <select
                    id="goal"
                    className={`${hubInputClass('belong')} max-w-md`}
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                  >
                    {peerNavigatorGoals.map((goalOption) => (
                      <option key={goalOption} value={goalOption}>{goalOption}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modality" className="block text-sm font-bold text-slate-900">Preferred modality</label>
                  <select
                    id="modality"
                    className={`${hubInputClass('belong')} max-w-md`}
                    value={modality}
                    onChange={(event) => setModality(event.target.value as (typeof peerNavigatorModalities)[number])}
                  >
                    {peerNavigatorModalities.map((modalityOption) => (
                      <option key={modalityOption} value={modalityOption}>{modalityOption}</option>
                    ))}
                  </select>
                </div>
              </div>

              <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.08em] text-emerald-800">
                  Safety context
                </summary>
                <div className="mt-3">
                  <label htmlFor="urgency" className="block text-sm font-bold text-slate-900">Urgency band</label>
                  <select
                    id="urgency"
                    className={`${hubInputClass('belong')} max-w-md`}
                    value={urgencyBand}
                    onChange={(event) => setUrgencyBand(event.target.value as 'not_urgent' | 'soon' | 'high_concern' | 'immediate_danger')}
                  >
                    <option value="not_urgent">Not urgent</option>
                    <option value="soon">Soon</option>
                    <option value="high_concern">High concern</option>
                    <option value="immediate_danger">Immediate danger</option>
                  </select>
                </div>
              </details>

              <HubAction
                type="submit"
                tone="belong"
                disabled={!selected}
                className="w-full max-w-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                Find a Peer
              </HubAction>
            </form>

            <div className="mt-6 grid gap-3">
              {matchingSteps.map((step, index) => (
                <article key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-emerald-800">Step {index + 1}</p>
                  <h3 className="mt-1 text-base font-black text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{step.description}</p>
                </article>
              ))}
            </div>

            <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.08em] text-emerald-800">
                First-run tips
              </summary>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {firstRunTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </details>
          </SurfaceCard>

          <div className="space-y-5">
            {metrics ? (
              <SurfaceCard className="border-sky-200 bg-white">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-800">Cycle metrics</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">Matching audit snapshot</h2>
                  </div>
                  <HubAction
                    type="button"
                    onClick={() => setShowMetricsDetail(!showMetricsDetail)}
                    tone="navigate"
                    variant="outline"
                    className="min-h-10"
                  >
                    {showMetricsDetail ? 'Hide details' : 'Show details'}
                  </HubAction>
                </div>
                {showMetricsDetail ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <MetricCard label="Eligible users" value={metrics.totalProfiles} />
                    <MetricCard label="Candidate pairs" value={metrics.totalCandidates} />
                    <MetricCard label="Final matches" value={metrics.totalFinalAssignments} />
                    <MetricCard label="Avg quality" value={metrics.averageFinalScore.toFixed(2)} />
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Details are available after each run without overwhelming the first interaction.
                  </p>
                )}
              </SurfaceCard>
            ) : (
              <HubPanel tone="belong" className="text-sm leading-6">
                Run a match to see anonymized results and transparent scoring details.
              </HubPanel>
            )}

            {triage ? (
              <HubPanel tone="stabilize" className="text-sm leading-6">
                <p className="font-black text-rose-900">Urgent support routing</p>
                <p className="mt-1 text-slate-700">{triage.message}</p>
                <a href={triage.actionHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-black text-rose-800 underline">
                  {triage.actionLabel}
                </a>
              </HubPanel>
            ) : null}

            {matches.length > 0 ? (
              <section className="space-y-4" aria-label="Peer match results">
                <SurfaceCard className="border-emerald-200 bg-emerald-50/45 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-emerald-800">Run summary</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {matches.length} suggestion{matches.length > 1 ? 's' : ''} generated for {selected}.
                  </p>
                </SurfaceCard>
                {matches.map((match, index) => (
                  <article key={match.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.1em] text-emerald-800">
                          {index === 0 ? 'Primary match' : 'Backup match'}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-950">{match.name}</h3>
                        <p className="mt-1 text-sm text-slate-700">{match.pronouns}</p>
                        <p className="mt-2 text-sm text-slate-700">Background: {match.background}</p>
                      </div>
                      {match.fairnessAdjusted ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-900">
                          Fairness adjusted
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-700">Score progression</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <ScoreCard label="Phase 1" value={match.phase1Score?.toFixed(2) ?? 'N/A'} tone="navigate" />
                        <ScoreCard
                          label="Phase 2"
                          value={match.phase2Score?.toFixed(2) ?? 'N/A'}
                          tone="belong"
                          adjustment={match.fairnessAdjustmentMagnitude}
                        />
                        <ScoreCard label="Phase 3" value={match.phase3Score?.toFixed(2) ?? 'N/A'} tone="practice" />
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-600">
                      Matches are anonymized in this demo. Production matching should remain consent-based,
                      privacy-preserving, and peer-verified.
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-600">Why this suggestion</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
                        {match.explanationFactors.map((factor) => (
                          <li key={`${match.name}-${factor}`}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            <HubPanel className="text-xs leading-5 text-slate-700">
              This is a demo with advanced metrics. In production, matching is privacy-preserving and peer-verified.
            </HubPanel>
          </div>
        </div>
      </PageContainer>
    </PageBackdrop>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</p>
      <p className="mt-1 text-xl font-black text-sky-900">{value}</p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  tone,
  adjustment,
}: {
  label: string;
  value: string;
  tone: 'navigate' | 'belong' | 'practice';
  adjustment?: number;
}) {
  const toneClass = {
    navigate: 'border-sky-200 bg-sky-50 text-sky-950',
    belong: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    practice: 'border-amber-200 bg-amber-50 text-amber-950',
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-[0.08em]">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
      {adjustment !== undefined && adjustment !== 0 ? (
        <p className="mt-1 text-xs font-bold">
          Adjustment: {adjustment > 0 ? '+' : ''}{adjustment.toFixed(3)}
        </p>
      ) : null}
    </div>
  );
}
