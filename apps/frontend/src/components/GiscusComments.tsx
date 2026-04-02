'use client';

import React, { useEffect, useRef } from 'react';

type GiscusConfig = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  strict: string;
  reactionsEnabled: string;
  emitMetadata: string;
  inputPosition: string;
  theme: string;
  lang: string;
};

function readGiscusConfig(): GiscusConfig | null {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!repo || !repoId || !category || !categoryId) {
    return null;
  }

  return {
    repo,
    repoId,
    category,
    categoryId,
    mapping: process.env.NEXT_PUBLIC_GISCUS_MAPPING || 'pathname',
    strict: process.env.NEXT_PUBLIC_GISCUS_STRICT || '0',
    reactionsEnabled: process.env.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED || '1',
    emitMetadata: process.env.NEXT_PUBLIC_GISCUS_EMIT_METADATA || '0',
    inputPosition: process.env.NEXT_PUBLIC_GISCUS_INPUT_POSITION || 'bottom',
    theme: process.env.NEXT_PUBLIC_GISCUS_THEME || 'light_high_contrast',
    lang: process.env.NEXT_PUBLIC_GISCUS_LANG || 'en',
  };
}

export default function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);
  const config = readGiscusConfig();

  useEffect(() => {
    if (!config || !ref.current) {
      return;
    }

    ref.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.setAttribute('data-repo', config.repo);
    script.setAttribute('data-repo-id', config.repoId);
    script.setAttribute('data-category', config.category);
    script.setAttribute('data-category-id', config.categoryId);
    script.setAttribute('data-mapping', config.mapping);
    script.setAttribute('data-strict', config.strict);
    script.setAttribute('data-reactions-enabled', config.reactionsEnabled);
    script.setAttribute('data-emit-metadata', config.emitMetadata);
    script.setAttribute('data-input-position', config.inputPosition);
    script.setAttribute('data-theme', config.theme);
    script.setAttribute('data-lang', config.lang);

    ref.current.appendChild(script);
  }, [config]);

  if (!config) {
    return (
      <div className="giscus-warning">
        Giscus is not configured. Add NEXT_PUBLIC_GISCUS_* variables to enable comments.
      </div>
    );
  }

  return (
    <div className="giscus-shell">
      <div ref={ref} className="giscus" />
    </div>
  );
}
