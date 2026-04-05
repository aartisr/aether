# Frontend (Next.js App Router)

This workspace contains the Aether web application, built on Next.js 14
(App Router), TypeScript, and Tailwind CSS.

## Runbook

From repository root:

```bash
npm run dev
```

From this directory (`apps/frontend`):

```bash
npm run dev        # start local development server
npm run lint       # run next lint
npm run typecheck  # run TypeScript checks
npm run test       # run unit tests via root jest config
npm run test:ci    # run unit tests with coverage
npm run build      # production build
npm run start      # serve production build
```

## Key Routes

- Home: `/`
- Blog: `/blog`
- Health check: `/api/health`

## Environment Variables

Core:

- `NEXT_PUBLIC_SITE_URL`: canonical base URL for metadata, sitemap, and robots

Echo local model switch:

- `NEXT_PUBLIC_ECHO_ENABLE_BROWSER_MODELS`: set to `true` to enable
    optional browser model path

Blog source adapters:

- `BLOG_SOURCE`: `local-markdown` (default) or `remote-json`
- `BLOG_CONTENT_DIR`: optional local markdown directory override
- `BLOG_REMOTE_JSON_URL`: required when using `remote-json`

Giscus comments:

- Required: `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`,
  `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- Optional: `NEXT_PUBLIC_GISCUS_MAPPING`, `NEXT_PUBLIC_GISCUS_STRICT`,
  `NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED`, `NEXT_PUBLIC_GISCUS_EMIT_METADATA`,
  `NEXT_PUBLIC_GISCUS_INPUT_POSITION`, `NEXT_PUBLIC_GISCUS_THEME`,
  `NEXT_PUBLIC_GISCUS_LANG`

## Runtime Notes

- App metadata is generated with App Router metadata APIs (`manifest.ts`,
  `robots.ts`, `sitemap.ts`).
- Security and cache headers are managed in `next.config.mjs`.
- Echo capture is privacy-first: local browser speech capture when available,
    with editable transcript fallback.
- Local AI analyzer supports pluggable runtimes and gracefully falls back to
    rules when optional runtime dependencies are unavailable.

## Deployment

- Vercel: deploy from repository root using `vercel.json`.
- Netlify: deploy from repository root using `netlify.toml`.
- Generic Node host: `npm run build` then `npm run start` from root or this workspace.
