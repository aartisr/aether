import React from 'react';

import HabitPlanner from '../../components/resilience/HabitPlanner';
import PeerCircleMatcher from '../../components/resilience/PeerCircleMatcher';
import ResourceNavigator from '../../components/resilience/ResourceNavigator';
import SafetyPlanBuilder from '../../components/resilience/SafetyPlanBuilder';
import WellbeingCheckIn from '../../components/resilience/WellbeingCheckIn';
import {
  hubBenchmarkInsights,
  hubSupportLanes,
  resiliencePathwayStages,
  researchReferences,
} from '../../lib/resilience-model';
import { createPageMetadata } from '../../lib/site';
import { ActionLink, CardGrid, PageBackdrop, PageContainer, SurfaceCard } from '../../components/page/PagePrimitives';
import { assertPageEnabledForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: 'Resilience Pathway',
  description:
    'Explore Aether’s resilience pathway with check-ins, safety planning, care navigation, peer circles, and habit planning for students.',
  path: '/resilience-pathway',
  keywords: ['student resilience pathway', 'safety planning', 'wellbeing check-in', 'care navigation'],
});

const operatingMetrics = [
  { value: '5', label: 'support modes', detail: 'check-in, safety, resources, peers, habits' },
  { value: '24/7', label: 'urgent lane', detail: 'crisis support is never hidden behind product UI' },
  { value: '0', label: 'required account', detail: 'the core hub can orient a student immediately' },
  { value: String(researchReferences.length), label: 'research inputs', detail: 'public-health, campus, peer, and product benchmarks' },
];

const quickJumpLinks = [
  { href: '#check-in', label: 'Check-in' },
  { href: '#safety-plan', label: 'Safety Plan' },
  { href: '#habit-planner', label: 'Habit Planner' },
  { href: '#research-inputs', label: 'Research Sources' },
];

export default function ResiliencePathway() {
  assertPageEnabledForRequest('resilience-pathway');

  return (
    <PageBackdrop className="bg-[#f5faf7] p-0 sm:p-4 md:p-8">
      <PageContainer className="max-w-7xl space-y-5 md:space-y-8">
        <header className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Student resilience command hub</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] text-slate-950 sm:text-5xl lg:text-6xl">
                Aether Resilience Hub
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                A warm, privacy-first operating system for student support: fast enough for the moment of need,
                careful enough for safety, and structured enough for campus teams to improve services without
                turning student wellbeing into surveillance.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ActionLink
                  href="#check-in"
                  label="Start check-in"
                  className="justify-center rounded-lg bg-emerald-700 px-5 py-3 text-white hover:bg-emerald-800 hover:no-underline"
                />
                <ActionLink
                  href="#safety-plan"
                  label="Build safety plan"
                  className="justify-center rounded-lg border border-emerald-200 bg-white px-5 py-3 text-emerald-800 hover:bg-emerald-50 hover:no-underline"
                />
                <ActionLink
                  href="https://988lifeline.org/"
                  label="Get 24/7 crisis support"
                  external
                  className="justify-center rounded-lg border border-rose-200 bg-rose-50 px-5 py-3 text-rose-800 hover:bg-rose-100 hover:no-underline"
                />
              </div>
            </div>
            <div className="border-t border-emerald-100 bg-slate-950 p-5 text-white sm:p-7 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Live care map</p>
                <div className="mt-5 grid gap-3">
                  {hubSupportLanes.map((lane, index) => (
                    <div key={lane.title} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-300 text-sm font-black text-slate-950">
                          {index + 1}
                        </span>
                        <div>
                          <h2 className="text-base font-black text-white">{lane.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{lane.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid border-t border-emerald-100 bg-emerald-50/70 sm:grid-cols-2 lg:grid-cols-4">
            {operatingMetrics.map((metric) => (
              <div key={metric.label} className="border-b border-emerald-100 p-4 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
                <p className="text-2xl font-black text-emerald-900">{metric.value}</p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-slate-800">{metric.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{metric.detail}</p>
              </div>
            ))}
          </div>
        </header>

        <details className="group rounded-2xl border border-emerald-100 bg-white">
          <summary className="cursor-pointer list-none p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Optional orientation</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">See how the full pathway fits together</h2>
              <span className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-emerald-800 group-open:hidden">Expand</span>
              <span className="hidden rounded-full border border-emerald-200 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-emerald-800 group-open:inline">Close</span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Start with the check-in below when you want action. Open this only for the five-module map, shortcuts, and design rationale.</p>
          </summary>
          <div className="space-y-5 border-t border-emerald-100 p-5 sm:p-6">
        <SurfaceCard className="border-emerald-100 bg-white p-0 shadow-none">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Intervention architecture</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">From first signal to sustained recovery</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The pathway is intentionally modular: each step can stand alone, but together they create a humane
              progression from noticing strain to building daily resilience.
            </p>
          </div>
          <CardGrid
            items={resiliencePathwayStages.map((stage, index) => ({
              ...stage,
              eyebrow: `Step ${index + 1}`,
            }))}
            columns="three"
            className="mt-4 md:mt-5"
            itemClassName="border-emerald-100 bg-emerald-50/40"
          />
        </SurfaceCard>

        <SurfaceCard className="border-emerald-100 bg-emerald-50/45">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Quick navigation</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Jump to one module at a time</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickJumpLinks.map((link) => (
                <a key={link.href} href={link.href} className="theme-pill no-underline hover:no-underline">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="border-emerald-200 bg-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Benchmark synthesis</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">What world-class wellbeing products get right</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            The hub translates proven product patterns into generic, swappable design requirements for any student
            support program.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {hubBenchmarkInsights.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm">
                <div className="mb-4 h-1 w-12 rounded-full bg-emerald-700" />
                <p className="text-sm font-black text-slate-950">{item.title}</p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-emerald-800">{item.source}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.insight}</p>
              </article>
            ))}
          </div>
        </SurfaceCard>
          </div>
        </details>

        <WellbeingCheckIn />
        <SafetyPlanBuilder />
        <ResourceNavigator />
        <PeerCircleMatcher />
        <HabitPlanner />

        <section id="research-inputs" className="scroll-mt-24">
          <SurfaceCard className="border-emerald-100 bg-white">
            <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
              Research and Benchmark Inputs ({researchReferences.length})
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These references informed feature selection, safety pathways, and resilience intervention patterns.
            </p>
            <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.08em] text-emerald-800">
                Show references
              </summary>
              <div className="mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
                {researchReferences.map((reference) => (
                  <article key={reference.name} className="rounded-xl border border-slate-200 p-4 bg-white">
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-black">{reference.category}</p>
                    <h3 className="text-base font-black text-slate-950 mt-1">{reference.name}</h3>
                    <p className="text-sm text-slate-700 mt-2">{reference.evidenceSignal}</p>
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-emerald-700 font-bold"
                    >
                      Visit Source
                    </a>
                  </article>
                ))}
              </div>
            </details>
          </SurfaceCard>
        </section>
      </PageContainer>
    </PageBackdrop>
  );
}
