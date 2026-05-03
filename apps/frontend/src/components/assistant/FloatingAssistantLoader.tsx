'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

type FloatingAssistantLoaderProps = {
  enabledPaths: string[];
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const AetherAssistant = dynamic(() => import('./AetherAssistant'), {
  ssr: false,
  loading: () => null,
});

export default function FloatingAssistantLoader({ enabledPaths }: FloatingAssistantLoaderProps) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const browserWindow = window as WindowWithIdleCallback;

    if (browserWindow.requestIdleCallback) {
      const idleHandle = browserWindow.requestIdleCallback(() => setCanRender(true), { timeout: 1500 });
      return () => browserWindow.cancelIdleCallback?.(idleHandle);
    }

    const timeoutHandle = window.setTimeout(() => setCanRender(true), 750);
    return () => window.clearTimeout(timeoutHandle);
  }, []);

  if (!canRender) {
    return null;
  }

  return <AetherAssistant enabledPaths={enabledPaths} />;
}
