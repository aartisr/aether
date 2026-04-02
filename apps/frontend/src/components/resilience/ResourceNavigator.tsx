"use client";

import { useMemo, useState } from 'react';

import { supportResources } from '../../lib/resilience-model';

const needTags = ['stress', 'sleep', 'focus', 'belonging', 'crisis', 'professional', 'campus'];

export default function ResourceNavigator() {
  const [selectedTag, setSelectedTag] = useState<string>('stress');

  const matches = useMemo(
    () => supportResources.filter((resource) => resource.tags.includes(selectedTag)),
    [selectedTag]
  );

  return (
    <section className="rounded-2xl bg-white p-4 sm:p-6 shadow-soft border border-indigo-100">
      <h2 className="text-xl sm:text-2xl font-bold text-indigo-800">Resource Navigator</h2>
      <p className="mt-2 text-sm text-gray-600">Match support options to what you need right now.</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {needTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag)}
            className={`shrink-0 px-3 py-2.5 rounded-lg text-sm border transition ${
              selectedTag === tag
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {matches.map((resource) => (
          <article key={resource.id} className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/40">
            <p className="text-xs uppercase tracking-wide text-indigo-700 font-semibold">{resource.type}</p>
            <h3 className="text-lg font-semibold text-indigo-900 mt-1">{resource.title}</h3>
            <p className="text-sm text-gray-700 mt-2">{resource.description}</p>
            <p className="text-xs text-gray-500 mt-2">Availability: {resource.availability}</p>
            <a
              href={resource.actionHref}
              className="inline-block mt-3 w-full sm:w-auto text-center px-3 py-2.5 rounded-lg border border-indigo-300 text-indigo-700 font-medium no-underline hover:bg-indigo-100"
            >
              {resource.actionLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
