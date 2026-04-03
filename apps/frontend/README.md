# Frontend (Next.js App Router)

This package hosts the Aether web experience built with Next.js 14, TypeScript, and Tailwind CSS.

## Scripts

```bash
npm run dev        # start local development server
npm run lint       # run next lint
npm run typecheck  # run TypeScript checks
npm run test       # run unit tests
npm run test:ci    # run unit tests with coverage
npm run build      # production build
npm run start      # serve production build
```

## Runtime Notes

- This app uses App Router metadata APIs (`manifest.ts`, `robots.ts`, `sitemap.ts`) for SEO and crawler support.
- `NEXT_PUBLIC_SITE_URL` should be set in production for canonical URLs and sitemap generation.
- Security and cache headers are configured in [next.config.mjs](next.config.mjs).
- The Echo experience uses a privacy-first local pipeline: browser speech recognition when available, editable transcript fallback, and on-device transcript analysis with no backend inference.
- The local Echo analyzer supports a pluggable runtime provider. It auto-falls back to the built-in rule engine when optional local model runtime dependencies are not installed.
- In corporate environments, install optional local runtime packages using your configured private registry credentials before enabling runtime-backed models.

## Deployment

- Vercel: use repository root with [vercel.json](../../vercel.json).
- Netlify: use repository root with [netlify.toml](../../netlify.toml).
- Any Node host: run `npm run build` then `npm run start` from workspace root.
