import React from 'react';

import HabitPlanner from '../../components/resilience/HabitPlanner';
import PeerCircleMatcher from '../../components/resilience/PeerCircleMatcher';
import ResourceNavigator from '../../components/resilience/ResourceNavigator';
import SafetyPlanBuilder from '../../components/resilience/SafetyPlanBuilder';
import WellbeingCheckIn from '../../components/resilience/WellbeingCheckIn';
import { researchReferences } from '../../lib/resilience-model';

const pathwayStages = [
  {
    title: 'Early Signal Detection',
    desc: 'Weekly check-in identifies stress, connection, sleep, and safety trends early.',
  },
  {
    title: 'Immediate Stabilization',
    desc: 'Students can create a practical safety plan and activate crisis support in one click.',
  },
  {
    title: 'Right-Sized Support',
    desc: 'Resource navigator routes students to peer, self-guided, campus, or urgent options.',
  },
  {
    title: 'Social Reinforcement',
    desc: 'Peer circles reduce isolation and create identity-safe belonging pathways.',
  },
  {
    title: 'Sustainable Growth',
    desc: 'Habit planning builds long-term resilience through short, repeatable daily actions.',
  },
];

export default function ResiliencePathway() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="rounded-2xl bg-white/90 p-6 md:p-8 shadow-soft border border-indigo-100">
          <h1 className="text-3xl md:text-5xl font-extrabold text-indigo-900">Aether Resilience Hub</h1>
          <p className="mt-3 text-gray-700 max-w-3xl">
            A complete, modular student resiliency ecosystem grounded in real-world institute and platform models.
            This implementation is generic by design, so campuses can swap resources, questions, and programs without rewriting UI.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-soft border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-800">Intervention Pathway</h2>
          <ol className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathwayStages.map((stage, index) => (
              <li key={stage.title} className="rounded-xl border border-indigo-100 p-4 bg-indigo-50/40">
                <p className="text-xs font-semibold uppercase text-indigo-700">Step {index + 1}</p>
                <h3 className="text-lg font-semibold text-indigo-900 mt-1">{stage.title}</h3>
                <p className="text-sm text-gray-700 mt-2">{stage.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <WellbeingCheckIn />
        <SafetyPlanBuilder />
        <ResourceNavigator />
        <PeerCircleMatcher />
        <HabitPlanner />

        <section className="rounded-2xl bg-white p-6 shadow-soft border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-800">Research and Benchmark Inputs (20)</h2>
          <p className="mt-2 text-sm text-gray-600">
            These references informed feature selection, safety pathways, and resilience intervention patterns.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </section>
      </div>
    </section>
  );
}
