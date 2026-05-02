import React from 'react';

import HabitPlanner from '../../components/resilience/HabitPlanner';
import PeerCircleMatcher from '../../components/resilience/PeerCircleMatcher';
import ResourceNavigator from '../../components/resilience/ResourceNavigator';
import SafetyPlanBuilder from '../../components/resilience/SafetyPlanBuilder';
import WellbeingCheckIn from '../../components/resilience/WellbeingCheckIn';
import { resiliencePathwayStages, researchReferences } from '../../lib/resilience-model';
import { createPageMetadata } from '../../lib/site';
import { CardGrid, PageBackdrop, PageContainer, PageHero, SurfaceCard } from '../../components/page/PagePrimitives';
import { assertPageEnabledForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: 'Resilience Pathway',
  description:
    'Explore Aether’s resilience pathway with check-ins, safety planning, care navigation, peer circles, and habit planning for students.',
  path: '/resilience-pathway',
  keywords: ['student resilience pathway', 'safety planning', 'wellbeing check-in', 'care navigation'],
});

export default function ResiliencePathway() {
  assertPageEnabledForRequest('resilience-pathway');

  return (
    <PageBackdrop className="p-2 sm:p-4 md:p-8">
      <PageContainer className="max-w-6xl space-y-5 md:space-y-8">
        <PageHero
          kicker="Student Support System"
          title="Aether Resilience Hub"
          description="A modular resilience ecosystem grounded in real-world student support models so campuses can swap resources and workflows without rewriting UI."
        />

        <SurfaceCard>
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-800">Intervention Pathway</h2>
          <CardGrid
            items={resiliencePathwayStages.map((stage, index) => ({
              ...stage,
              eyebrow: `Step ${index + 1}`,
            }))}
            columns="two"
            className="mt-4 md:mt-5"
            itemClassName="border-indigo-100 bg-indigo-50/40"
          />
        </SurfaceCard>

        <WellbeingCheckIn />
        <SafetyPlanBuilder />
        <ResourceNavigator />
        <PeerCircleMatcher />
        <HabitPlanner />

        <SurfaceCard>
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-800">Research and Benchmark Inputs (20)</h2>
          <p className="mt-2 text-sm text-gray-600">
            These references informed feature selection, safety pathways, and resilience intervention patterns.
          </p>
          <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {researchReferences.map((reference) => (
              <article key={reference.name} className="rounded-xl border border-indigo-100 p-4 bg-indigo-50/30">
                <p className="text-xs uppercase tracking-wide text-indigo-700 font-semibold">{reference.category}</p>
                <h3 className="text-base font-semibold text-indigo-900 mt-1">{reference.name}</h3>
                <p className="text-sm text-gray-700 mt-2">{reference.evidenceSignal}</p>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-indigo-700 font-medium"
                >
                  Visit Source
                </a>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </PageContainer>
    </PageBackdrop>
  );
}
