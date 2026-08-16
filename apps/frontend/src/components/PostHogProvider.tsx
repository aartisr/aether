'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { subscribeToAnalytics, track } from '../lib/analytics';

const postHogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const enabled = Boolean(postHogKey) && process.env.NEXT_PUBLIC_POSTHOG_ENABLED !== 'false';
const persistentStorage = process.env.NEXT_PUBLIC_POSTHOG_PERSISTENCE === 'localStorage';

function runWhenIdle(callback: () => void) {
  const idleWindow = window as Window & {
    requestIdleCallback?: (work: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
    const id = idleWindow.requestIdleCallback(callback, { timeout: 2500 });
    return () => idleWindow.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(callback, 1);
  return () => window.clearTimeout(id);
}

function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) track('$pageview', { path: pathname });
  }, [pathname]);

  return null;
}

/**
 * A low-impact PostHog adapter. It is completely inert without a public key,
 * initializes off the critical rendering path, queues early events, and uses
 * ephemeral storage by default for this privacy-sensitive product.
 */
export default function PostHogProvider() {
  useEffect(() => {
    if (!enabled || !postHogKey) return;

    let unsubscribe: () => void = () => {};
    let disposed = false;
    const cancelIdleWork = runWhenIdle(() => {
      void import('posthog-js')
        .then(({ default: posthog }) => {
          if (disposed) return;

          posthog.init(postHogKey, {
            api_host: postHogHost,
            autocapture: false,
            capture_pageview: false,
            disable_session_recording: true,
            person_profiles: 'identified_only',
            persistence: persistentStorage ? 'localStorage' : 'memory',
          });
          unsubscribe = subscribeToAnalytics(({ name, properties }) => posthog.capture(name, properties));
        })
        .catch(() => {
          // Analytics must never affect the product experience or error UI.
        });
    });

    return () => {
      disposed = true;
      cancelIdleWork();
      unsubscribe();
    };
  }, []);

  return enabled ? <PostHogPageView /> : null;
}
