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

## Deployment

- Vercel: use repository root with [vercel.json](../../vercel.json).
- Netlify: use repository root with [netlify.toml](../../netlify.toml).
- Any Node host: run `npm run build` then `npm run start` from workspace root.
