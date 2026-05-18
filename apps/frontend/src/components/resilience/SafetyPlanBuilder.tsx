"use client";

import { useEffect, useState } from 'react';

import { HubAction, HubLinkAction, HubPanel, HubSection, hubInputClass } from './ResilienceHubPrimitives';

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
    <HubSection
      id="safety-plan"
      tone="stabilize"
      eyebrow="Stabilization plan"
      title="Safety Plan Builder"
      description="Create a practical plan before stress peaks. It stays local in this browser unless you choose to copy it."
      aside={
        <HubPanel tone="stabilize" className="text-sm leading-6">
          If danger feels immediate, skip the form and contact emergency services or 988 in the United States.
        </HubPanel>
      }
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6">
        <PlanField
          id="warningSigns"
          label="My warning signs"
          value={plan.warningSigns}
          onChange={(value) => setPlan((prev) => ({ ...prev, warningSigns: value }))}
          tone="stabilize"
        />
        <PlanField
          id="copingSteps"
          label="My coping steps"
          value={plan.copingSteps}
          onChange={(value) => setPlan((prev) => ({ ...prev, copingSteps: value }))}
          tone="stabilize"
        />
        <PlanField
          id="trustedPeople"
          label="Trusted people I will contact"
          value={plan.trustedPeople}
          onChange={(value) => setPlan((prev) => ({ ...prev, trustedPeople: value }))}
          tone="stabilize"
        />
        <PlanField
          id="professionalSupport"
          label="Professional or campus support"
          value={plan.professionalSupport}
          onChange={(value) => setPlan((prev) => ({ ...prev, professionalSupport: value }))}
          tone="stabilize"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-bold text-slate-900" htmlFor="reasonToStay">
          My immediate reason to stay safe today
        </label>
        <textarea
          id="reasonToStay"
          value={plan.reasonToStay}
          onChange={(event) => setPlan((prev) => ({ ...prev, reasonToStay: event.target.value }))}
          rows={3}
          className={hubInputClass('stabilize')}
        />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <HubAction type="button" onClick={savePlan} className="w-full sm:w-auto">
          Save Locally
        </HubAction>
        <HubAction type="button" onClick={exportPlan} variant="outline" className="w-full sm:w-auto">
          Copy as JSON
        </HubAction>
        <HubLinkAction href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer" tone="stabilize" className="w-full sm:w-auto">
          24/7 Crisis Support
        </HubLinkAction>
      </div>
      <p className="mt-3 text-xs text-slate-500">Last saved: {savedAt}</p>
    </HubSection>
  );
}

function PlanField({
  id,
  label,
  value,
  onChange,
  tone,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  tone: 'stabilize';
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-900" htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className={hubInputClass(tone)}
      />
    </div>
  );
}
