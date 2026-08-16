# Production Readiness Standard

Status: required before a public student-support launch  
Owner: product and engineering

## Automated release gates

Every pull request and change to `main` must pass:

1. Locked, reproducible dependency install through the configured corporate registry.
2. Lint, TypeScript validation, unit tests, and enforced coverage floors.
3. Production build.
4. Chromium end-to-end coverage for desktop and mobile critical flows.
5. Performance smoke budget against the production build.

The CI definition is the source of truth: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Operations checklist

Before enabling a public deployment:

- Confirm the health endpoint responds at `/api/health` and configure an external uptime monitor.
- Configure error monitoring with alert routing to an on-call owner; do not send reflection, transcript, or user-entered support content to telemetry.
- Validate the corporate registry is reachable from both GitHub Actions and Vercel.
- Keep `NEXT_PUBLIC_POSTHOG_PERSISTENCE=memory` unless a documented consent decision explicitly permits persistent analytics.
- Test the emergency and crisis routes without authentication and with JavaScript disabled where practical.
- Review feature flags so disabled pages are not linked by homepage, navigation, sitemap, or CMS content.
- Perform a privacy, accessibility, and clinical-content review for every material support-flow change.

## Incident response

1. Stabilize: disable the affected page with page controls when a support, privacy, or safety issue is identified.
2. Preserve only non-sensitive diagnostic evidence. Never copy user reflections or transcripts into tickets.
3. Escalate urgent safety concerns to the designated human response owner; Aether is not emergency care.
4. Communicate scope, mitigation, and recovery criteria to affected stakeholders.
5. Document the root cause and add a regression test before re-enabling the feature.

## Data minimization rule

Telemetry may describe an interaction category or route, but must not include free text, audio, transcripts, sensitive support context, identifiers, or inferred mental-health attributes.
