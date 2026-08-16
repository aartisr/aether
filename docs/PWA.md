# Aether Progressive Web App

Aether is installable without a third-party runtime or build plugin. The implementation uses the App Router manifest, a small registration component, and a deliberately narrow service worker.

## What users get

- Desktop and laptop browsers with PWA installation support receive the browser-native install dialog from the **Install Aether** control in the footer.
- Android browsers use the same native prompt when available.
- iPhone and iPad users get clear Safari instructions: Share, **Add to Home Screen**, then Add.
- Installed copies open in a standalone app window and expose shortcuts for the Resilience Pathway, Echo Chamber, Journal, Ask Aether, and Feedback.

## Privacy and offline behavior

The worker pre-caches only the offline page, manifest, and public brand icons. It caches static scripts, styles, fonts, and images after they are requested. It never intercepts or stores API requests, admin pages, form submissions, reflections, recordings, or other user-entered content. If a navigation cannot reach the network, it shows `/offline` instead of a stale support page.

## Deployment checklist

1. Deploy over HTTPS (localhost is also accepted by browsers for development).
2. Confirm `/manifest.webmanifest`, `/sw.js`, and `/icons/aether-512.png` return 200.
3. Confirm `/sw.js` returns `Cache-Control: no-cache` and `Service-Worker-Allowed: /`.
4. In Chrome or Edge DevTools, Application → Manifest should report installability. On iOS, test the Safari Share → Add to Home Screen path on a physical device.

The service-worker cache name is versioned in `public/sw.js`. Increment it whenever cache strategy or shell assets change, so an updated deployment removes old worker caches during activation.
