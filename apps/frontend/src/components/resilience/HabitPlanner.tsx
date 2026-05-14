"use client";

import { useEffect, useMemo, useState } from 'react';

import { habitTemplates } from '../../lib/resilience-model';
import { HubPanel, HubSection } from './ResilienceHubPrimitives';

const storageKey = 'aether.habit-checks.v1';

export default function HabitPlanner() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Record<string, boolean>;
      setCompleted(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completed));
  }, [completed]);

  const doneCount = useMemo(
    () => habitTemplates.filter((habit) => completed[habit.id]).length,
    [completed]
  );

  return (
    <HubSection
      id="habit-planner"
      tone="practice"
      eyebrow="Daily practice"
      title="7-Day Habit Planner"
      description="Use short routines to build resilience without overwhelming your schedule."
      aside={
        <HubPanel tone="practice" className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">Completed today</p>
          <p className="text-2xl font-black text-amber-950">{doneCount}/{habitTemplates.length}</p>
        </HubPanel>
      }
    >

      <div className="mt-5 space-y-3">
        {habitTemplates.map((habit) => (
          <label key={habit.id} className="flex gap-3 items-start border border-slate-200 rounded-xl p-3 sm:p-4 bg-slate-50">
            <input
              type="checkbox"
              checked={Boolean(completed[habit.id])}
              onChange={(event) =>
                setCompleted((prev) => ({
                  ...prev,
                  [habit.id]: event.target.checked,
                }))
              }
              className="mt-1 h-5 w-5"
            />
            <div>
              <p className="font-black text-slate-950 text-sm sm:text-base">{habit.title} ({habit.minutes} min)</p>
              <p className="text-sm text-slate-700">{habit.rationale}</p>
              <p className="text-xs text-slate-500 mt-1">Tags: {habit.tags.join(', ')}</p>
            </div>
          </label>
        ))}
      </div>
    </HubSection>
  );
}
