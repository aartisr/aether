"use client";

import { useMemo, useState } from 'react';

import { supportResources } from '../../lib/resilience-model';
import { HubAction, HubLinkAction, HubSection } from './ResilienceHubPrimitives';

const needTags = ['stress', 'sleep', 'focus', 'belonging', 'crisis', 'professional', 'campus'];

export default function ResourceNavigator() {
  const [selectedTag, setSelectedTag] = useState<string>('stress');

  const matches = useMemo(
    () => supportResources.filter((resource) => resource.tags.includes(selectedTag)),
    [selectedTag]
  );

  return (
    <HubSection
      tone="navigate"
      eyebrow="Care routing"
      title="Resource Navigator"
      description="Match support options to what you need right now."
    >
      <div className="mt-4 flex flex-wrap gap-2">
        {needTags.map((tag) => (
          <HubAction
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag)}
            tone="navigate"
            variant={selectedTag === tag ? 'solid' : 'outline'}
            className="min-h-10 px-3"
          >
            {tag}
          </HubAction>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {matches.map((resource) => (
          <article key={resource.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <p className="text-xs uppercase tracking-wide text-sky-700 font-black">{resource.type}</p>
            <h3 className="text-lg font-black text-slate-950 mt-1">{resource.title}</h3>
            <p className="text-sm text-slate-700 mt-2">{resource.description}</p>
            <p className="text-xs text-slate-500 mt-2">Availability: {resource.availability}</p>
            <HubLinkAction
              href={resource.actionHref}
              tone="navigate"
              variant="outline"
              className="mt-3 w-full sm:w-auto"
            >
              {resource.actionLabel}
            </HubLinkAction>
          </article>
        ))}
      </div>
    </HubSection>
  );
}
