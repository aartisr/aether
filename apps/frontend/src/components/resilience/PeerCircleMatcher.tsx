"use client";

import { useMemo, useState } from 'react';

import { peerCircles } from '../../lib/resilience-model';

const focusOptions = ['belonging', 'focus', 'sleep', 'identity', 'academic stress', 'care navigation'];

export default function PeerCircleMatcher() {
  const [selection, setSelection] = useState<string>('belonging');

  const ranked = useMemo(
    () =>
      [...peerCircles].sort((a, b) => {
        const aScore = a.focus.includes(selection) ? 1 : 0;
        const bScore = b.focus.includes(selection) ? 1 : 0;
        return bScore - aScore;
      }),
    [selection]
  );

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft border border-indigo-100">
      <h2 className="text-2xl font-bold text-indigo-800">Peer Circle Matcher</h2>
      <p className="mt-2 text-sm text-gray-600">Find the most relevant support cohort for your current challenge.</p>

      <label htmlFor="focus" className="block text-sm font-medium text-indigo-900 mt-4">
        Primary focus area
      </label>
      <select
        id="focus"
        value={selection}
        onChange={(event) => setSelection(event.target.value)}
        className="mt-2 w-full max-w-sm rounded-xl border border-indigo-200 p-2"
      >
        {focusOptions.map((focus) => (
          <option key={focus} value={focus}>
            {focus}
          </option>
        ))}
      </select>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {ranked.map((circle) => (
          <article key={circle.id} className="rounded-xl border border-indigo-100 p-4 bg-indigo-50/30">
            <h3 className="font-semibold text-indigo-900">{circle.name}</h3>
            <p className="text-sm text-gray-700 mt-1">{circle.audience}</p>
            <p className="text-xs text-gray-500 mt-2">Format: {circle.format}</p>
            <p className="text-xs text-gray-500">Focus: {circle.focus.join(', ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
