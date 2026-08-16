# PostHog integration

The Aether PostHog integration is opt-in and built for privacy-sensitive student-support workflows.

## Enable in two variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_public_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Set the host to your PostHog Cloud region or self-hosted ingestion endpoint. On the next deploy, the client SDK starts only after the initial rendering work is idle. When the key is empty—or `NEXT_PUBLIC_POSTHOG_ENABLED=false`—the integration is inert and does not download the PostHog SDK.

## Privacy and performance contract

- Autocapture and session recording are disabled.
- Persistence defaults to `memory`, not cookies or local storage.
- PostHog person profiles are created only for explicitly identified users; Aether does not identify visitors by default.
- Route events omit query strings and hashes.
- The reusable `track()` helper rejects sensitive property names and redacts email- and phone-shaped strings. It intentionally never receives free-form feedback, transcripts, audio, contact details, or safety context.
- Events fired before the SDK becomes ready are held in a bounded in-memory queue of 25 events; analytics failures are swallowed so the product experience cannot fail because telemetry failed.

If consent supports durable analytics, explicitly set `NEXT_PUBLIC_POSTHOG_PERSISTENCE=localStorage`. Do not enable it merely to improve metrics.

## Add a product event

```ts
import { track } from '../lib/analytics';

track('resilience_checkin_completed', {
  checkin_mode: 'guided',
});
```

Use stable snake_case event names and low-cardinality, non-sensitive properties. Prefer an aggregate such as `checkin_mode` over user-entered text. The current baseline includes `$pageview`, `application_error`, and `feedback_submitted` without capturing feedback content.

## GitHub Pages and Wiki

The Pages workflow publishes the lightweight project atlas in `docs/site`. It is a discovery gateway only: its canonical tag and every product-facing link point to the main Aether website. The editable Wiki seed pages are in `docs/wiki`; mirror them into the enabled GitHub Wiki after the first repository publish.
