'use client';

import { useEffect } from 'react';
import { canRegisterServiceWorker } from '../../lib/pwa';

/** Registers the privacy-safe app shell worker once, after the application hydrates. */
export default function PwaProvider() {
  useEffect(() => {
    if (!canRegisterServiceWorker(navigator, window.isSecureContext)) {
      return;
    }

    void navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).catch(() => {
      // PWA capability is additive. A failed registration must never interrupt support access.
    });
  }, []);

  return null;
}
