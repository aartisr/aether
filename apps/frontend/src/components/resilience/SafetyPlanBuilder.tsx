"use client";

import { useEffect, useState } from 'react';

interface SafetyPlan {
  warningSigns: string;
  copingSteps: string;
  trustedPeople: string;
  professionalSupport: string;
  reasonToStay: string;
}

const storageKey = 'aether.safety-plan.v1';

const initialPlan: SafetyPlan = {
  warningSigns: '',
  copingSteps: '',
  trustedPeople: '',
  professionalSupport: '',
  reasonToStay: '',
};

export default function SafetyPlanBuilder() {
  const [plan, setPlan] = useState<SafetyPlan>(initialPlan);
  const [savedAt, setSavedAt] = useState<string>('Not saved yet');

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { plan: SafetyPlan; savedAt: string };
      setPlan(parsed.plan);
      setSavedAt(parsed.savedAt);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const savePlan = () => {
    const timestamp = new Date().toLocaleString();
    window.localStorage.setItem(storageKey, JSON.stringify({ plan, savedAt: timestamp }));
    setSavedAt(timestamp);
  };

  const exportPlan = async () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const text = await blob.text();
    await navigator.clipboard.writeText(text);
    window.alert('Safety plan copied to clipboard.');
  };

  return (
    <section id="safety-plan" className="rounded-2xl bg-white p-4 sm:p-6 shadow-soft border border-indigo-100">
      <h2 className="text-xl sm:text-2xl font-bold text-indigo-800">Safety Plan Builder</h2>
      <p className="mt-2 text-sm text-gray-600">Create a practical plan before stress peaks. Saved locally in your browser.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6">
        <PlanField
          id="warningSigns"
          label="My warning signs"
          value={plan.warningSigns}
          onChange={(value) => setPlan((prev) => ({ ...prev, warningSigns: value }))}
        />
        <PlanField
          id="copingSteps"
          label="My coping steps"
          value={plan.copingSteps}
          onChange={(value) => setPlan((prev) => ({ ...prev, copingSteps: value }))}
        />
        <PlanField
          id="trustedPeople"
          label="Trusted people I will contact"
          value={plan.trustedPeople}
          onChange={(value) => setPlan((prev) => ({ ...prev, trustedPeople: value }))}
        />
        <PlanField
          id="professionalSupport"
          label="Professional or campus support"
          value={plan.professionalSupport}
          onChange={(value) => setPlan((prev) => ({ ...prev, professionalSupport: value }))}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-indigo-900" htmlFor="reasonToStay">
          My immediate reason to stay safe today
        </label>
        <textarea
          id="reasonToStay"
          value={plan.reasonToStay}
          onChange={(event) => setPlan((prev) => ({ ...prev, reasonToStay: event.target.value }))}
          rows={3}
          className="mt-2 w-full border border-indigo-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <button type="button" onClick={savePlan} className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
          Save Locally
        </button>
        <button type="button" onClick={exportPlan} className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50">
          Copy as JSON
        </button>
        <a href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-center px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold no-underline hover:bg-red-700">
          24/7 Crisis Support
        </a>
      </div>
      <p className="mt-3 text-xs text-gray-500">Last saved: {savedAt}</p>
    </section>
  );
}

function PlanField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-indigo-900" htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full border border-indigo-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  );
}
