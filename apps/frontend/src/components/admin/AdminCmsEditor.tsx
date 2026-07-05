'use client';

import '@puckeditor/core/puck.css';

import React, { useState, useTransition } from 'react';
import { Puck } from '@puckeditor/core';
import type { Data } from '@puckeditor/core';
import type { CmsPageDefinition } from '../../lib/cms/page-registry';
import { createDefaultCmsPageData, cmsPuckConfig, ensureContentIds } from '../../lib/cms/puck-config';
import { clearCmsPageAction, resetCmsDraftAction, saveCmsPageAction } from '../../app/admin/cms/actions';

type AdminCmsEditorProps = {
  pages: readonly CmsPageDefinition[];
  selectedPage: CmsPageDefinition;
  initialData: Data;
  hasPublishedData: boolean;
};

export default function AdminCmsEditor({ pages, selectedPage, initialData, hasPublishedData }: AdminCmsEditorProps) {
  const [data, setData] = useState<Data>(ensureContentIds(initialData));
  const [status, setStatus] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const handleClearPublished = () => {
    startTransition(async () => {
      const result = await clearCmsPageAction({ pageId: selectedPage.id });
      setStatus(result.message);
    });
  };

  const handleResetDraft = () => {
    startTransition(async () => {
      const result = await resetCmsDraftAction({ pageId: selectedPage.id });
      if (result.ok && result.data) {
        setData(result.data as Data);
      } else {
        setData(createDefaultCmsPageData(selectedPage));
      }
      setStatus(result.message);
    });
  };

  const workflowSteps = ['Choose page', 'Edit blocks', 'Publish'];

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin CMS</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Page Editor</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          Select any public route, edit content with Puck, and publish instantly. Published content overrides the route output.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {pages.map((page) => {
            const isActive = page.id === selectedPage.id;
            return (
              <a
                key={page.id}
                href={`/admin/cms?page=${page.id}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold no-underline transition ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {page.name}
              </a>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">Quick workflow</p>
          <ol className="mt-2 grid gap-2 text-sm font-semibold text-slate-800 sm:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <li key={step} className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>

        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">Advanced actions</summary>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">Editing: {selectedPage.name}</p>
            <p className="text-xs text-slate-600">
              {selectedPage.id === 'global-shell' ? 'Scope: Global shell' : `Route: ${selectedPage.path}`}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {selectedPage.id === 'global-shell'
                ? hasPublishedData
                  ? 'Published override exists for global shell content.'
                  : 'No published override yet. Default shell content is active.'
                : hasPublishedData
                  ? 'Published override exists for this route.'
                  : 'No published override yet. Route fallback is active.'}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleResetDraft}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Reset Draft Scaffold
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleClearPublished}
            className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
          >
            Clear Published Override
          </button>
          </div>
        </details>

        {status ? (
          <div role="status" className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">{status}</div>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">How to edit:</p>
          <ul className="mt-2 space-y-1 list-inside list-disc text-xs">
            <li>Drag blocks from the sidebar to reorder them.</li>
            <li>Click any block to edit its properties on the right.</li>
            <li>Use the <strong>+</strong> button in the canvas to add new blocks.</li>
            <li>Click <strong>Publish</strong> (top-right) to save and deploy.</li>
          </ul>
        </div>
        <div className="flex h-screen w-full flex-col">
          <Puck
            config={cmsPuckConfig}
            data={data}
            onChange={setData}
            onPublish={async (nextData) => {
              const normalizedData = ensureContentIds(nextData);
              setData(normalizedData);
              const result = await saveCmsPageAction({ pageId: selectedPage.id, data: normalizedData });
              setStatus(result.message);
            }}
          />
        </div>
      </div>
    </section>
  );
}
