"use client";

import React, { useState } from 'react';

import { PageBackdrop, PageContainer, PageHero, SurfaceCard } from '../../components/page/PagePrimitives';
import { HubAction, HubPanel, hubInputClass } from '../../components/resilience/ResilienceHubPrimitives';
import {
  createPeerNavigatorMatcher,
  peerNavigatorBackgrounds,
  runPeerNavigatorMatch,
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

export default function PeerNavigator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<PeerNavigatorMatchResult[]>([]);
  const [metrics, setMetrics] = useState<PeerNavigatorMetrics | null>(null);
  const [showMetricsDetail, setShowMetricsDetail] = useState(false);

  const handleMatch = () => {
    if (!selected) return;

    const result = runPeerNavigatorMatch(selected, matcher);
    setMetrics(result.metrics);
    setMatches(result.matches);
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

            {matches.length > 0 ? (
              <section className="space-y-4" aria-label="Peer match results">
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
