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
npm run perf:smoke # run perf smoke checks against a local prod server
npm run perf:budget # build + perf smoke checks
```

## Key Routes

- Home: `/`
- Blog: `/blog`
- Health check: `/api/health`

## Environment Variables

Core:

- `NEXT_PUBLIC_SITE_URL`: canonical base URL for metadata, sitemap, and robots
  (optional on Vercel when system environment variables are exposed)

Page toggles (plug-and-play route control):

- `NEXT_PUBLIC_DISABLED_PAGES`: comma-separated page IDs to disable
- `NEXT_PUBLIC_ENABLED_PAGES`: comma-separated allowlist of page IDs to enable
- If `NEXT_PUBLIC_ENABLED_PAGES` is set, it takes priority over disabled list
- `home` is always enabled
- Supported IDs:
  `resilience-pathway, echo, peer-navigator, blog, fairness-governance, privacy, accessibility, about, mentors`
- Runtime admin page (cookie-based, no restart): `/admin/page-controls`
- Admin sign-in route: `/admin/login`
- Production safety gate for admin page: `AETHER_ENABLE_ADMIN_PAGE=true`
- Required admin credentials: `AETHER_ADMIN_ACCESS_KEY` (or `AETHER_ADMIN_ACCESS_KEYS` as comma-separated values)
- Optional session hardening: `AETHER_ADMIN_SESSION_SECRET`
- Optional admin session lifetime (minutes): `AETHER_ADMIN_SESSION_TTL_MINUTES` (default: `480`)

Examples:

- Disable two pages:
  `NEXT_PUBLIC_DISABLED_PAGES=mentors,fairness-governance`
- Run a minimal build with only core journey pages:
  `NEXT_PUBLIC_ENABLED_PAGES=resilience-pathway,echo,peer-navigator`

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
- Use a public discussion repository only; public deployments should not expose
  non-public project names.

## Runtime Notes

- App metadata is generated with App Router metadata APIs (`manifest.ts`,
  `robots.ts`, `sitemap.ts`).
- Security and cache headers are managed in `next.config.mjs`.
- Echo capture is privacy-first: local browser speech capture when available,
    with editable transcript fallback.
- Local AI analyzer supports pluggable runtimes and gracefully falls back to
    rules when optional runtime dependencies are unavailable.

## Performance Budget Pipeline

- CI now enforces route-level latency budgets using `scripts/perf-smoke.mjs`.
- The script starts a production server, warms routes, and verifies p95 latency
  against a hard threshold.

Supported knobs:

- `PERF_BUDGET_P95_MS`: p95 threshold per route (default: `900`)
- `PERF_ROUTES`: comma-separated route list
- `PERF_SAMPLES`: measured requests per route (default: `5`)
- `PERF_WARMUPS`: warmup requests per route (default: `2`)
- `PERF_TIMEOUT_MS`: per-request timeout (default: `4000`)
- `PERF_PORT`: local server port used by the checker (default: `4010`)

## Page Architecture

- Reusable page atoms live in `src/components/page`.
- Route-specific copy and configuration live in `src/lib/*` modules where
  practical, keeping page files thin.
- Use `JsonLd`, `PageBackdrop`, `PageContainer`, `PageHero`, `SurfaceCard`,
  `CardGrid`, and `LinkCardGrid` for new pages before adding bespoke markup.
- XML and feed helpers live in `src/lib/xml`; add new machine-readable routes
  by composing those helpers rather than duplicating escaping logic.
- Centralized page registry and feature toggles live in `src/lib/page-flags.ts`.
  Navigation, sitemap, llms.txt, image sitemap, and route guards consume this
  registry so toggles apply consistently.

## Deployment

- Vercel: deploy from repository root using `vercel.json`. The app resolves
  canonicals from `NEXT_PUBLIC_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, or
  `VERCEL_URL`.
- Netlify: deploy from repository root using `netlify.toml`.
- Generic Node host: `npm run build` then `npm run start` from root or this workspace.
