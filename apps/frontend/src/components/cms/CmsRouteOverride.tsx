'use client';

import '@puckeditor/core/puck.css';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Render } from '@puckeditor/core';
import type { Data } from '@puckeditor/core';
import { cmsPuckConfig } from '../../lib/cms/puck-config';

type CmsRouteOverrideProps = {
  children: React.ReactNode;
};

type CmsApiResponse = {
  ok: boolean;
  pageId: string | null;
  data: Data | null;
};

const NON_PUBLIC_PREFIXES = ['/admin', '/api', '/_next'];
const NATIVE_ONLY_PATHS = ['/peer-navigator', '/resilience-pathway', '/echo'];

function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, '');
  return trimmed.length === 0 ? '/' : trimmed;
}

function shouldSkipCms(pathname: string): boolean {
  return (
    NON_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || NATIVE_ONLY_PATHS.includes(pathname)
  );
}

export default function CmsRouteOverride({ children }: CmsRouteOverrideProps) {
  const pathname = usePathname();
  const normalizedPath = useMemo(() => normalizePath(pathname || '/'), [pathname]);
  const [cmsData, setCmsData] = useState<Data | null>(null);
  const [cmsPageId, setCmsPageId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCmsData() {
      if (!normalizedPath || shouldSkipCms(normalizedPath)) {
        setCmsData(null);
        setCmsPageId(null);
        return;
      }

      try {
        const response = await fetch(`/api/cms/page?path=${encodeURIComponent(normalizedPath)}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          setCmsData(null);
          setCmsPageId(null);
          return;
        }

        const payload = (await response.json()) as CmsApiResponse;
        if (!cancelled) {
          setCmsData(payload.ok ? payload.data : null);
          setCmsPageId(payload.ok ? payload.pageId : null);
        }
      } catch {
        if (!cancelled) {
          setCmsData(null);
          setCmsPageId(null);
        }
      }
    }

    loadCmsData();

    return () => {
      cancelled = true;
    };
  }, [normalizedPath]);

  if (cmsData) {
    return (
      <div
        className={
          cmsPageId === 'home'
            ? 'home-page w-full space-y-10 overflow-hidden px-3 pb-12 sm:px-4 md:space-y-12 md:px-6'
            : 'w-full'
        }
      >
        <Render config={cmsPuckConfig} data={cmsData} />
      </div>
    );
  }

  return <>{children}</>;
}
