"use client";

import { useEffect, useMemo, useState } from 'react';

import { habitTemplates } from '../../lib/resilience-model';

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
    <section id="habit-planner" className="rounded-2xl bg-white p-6 shadow-soft border border-indigo-100">
      <h2 className="text-2xl font-bold text-indigo-800">7-Day Habit Planner</h2>
      <p className="mt-2 text-sm text-gray-600">Use short routines to build resilience without overwhelming your schedule.</p>
      <p className="mt-1 text-sm text-indigo-800 font-medium">Completed today: {doneCount}/{habitTemplates.length}</p>

      <div className="mt-5 space-y-3">
        {habitTemplates.map((habit) => (
          <label key={habit.id} className="flex gap-3 items-start border border-indigo-100 rounded-xl p-3 bg-indigo-50/30">
            <input
              type="checkbox"
              checked={Boolean(completed[habit.id])}
              onChange={(event) =>
                setCompleted((prev) => ({
                  ...prev,
                  [habit.id]: event.target.checked,
                }))
              }
              className="mt-1 h-4 w-4"
            />
            <div>
              <p className="font-semibold text-indigo-900">{habit.title} ({habit.minutes} min)</p>
              <p className="text-sm text-gray-700">{habit.rationale}</p>
              <p className="text-xs text-gray-500 mt-1">Tags: {habit.tags.join(', ')}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
