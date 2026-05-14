"use client";

import { useMemo, useState } from 'react';

import { peerCircles } from '../../lib/resilience-model';
import { HubSection, hubInputClass } from './ResilienceHubPrimitives';

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
    <HubSection
      tone="belong"
      eyebrow="Belonging engine"
      title="Peer Circle Matcher"
      description="Find the most relevant support cohort for your current challenge."
    >
      <label htmlFor="focus" className="block text-sm font-bold text-slate-900 mt-4">
        Primary focus area
      </label>
      <select
        id="focus"
        value={selection}
        onChange={(event) => setSelection(event.target.value)}
        className={`${hubInputClass('belong')} sm:max-w-sm`}
      >
        {focusOptions.map((focus) => (
          <option key={focus} value={focus}>
            {focus}
          </option>
        ))}
      </select>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {ranked.map((circle) => (
          <article key={circle.id} className="rounded-xl border border-slate-200 p-4 bg-emerald-50/40">
            <h3 className="font-black text-slate-950 text-sm sm:text-base">{circle.name}</h3>
            <p className="text-sm text-slate-700 mt-1">{circle.audience}</p>
            <p className="text-xs text-slate-500 mt-2">Format: {circle.format}</p>
            <p className="text-xs text-slate-500">Focus: {circle.focus.join(', ')}</p>
          </article>
        ))}
      </div>
    </HubSection>
  );
}
