'use client';

import { useEffect, useState } from 'react';
import {
  isIosDevice,
  isStandaloneMode,
  PWA_INSTALL_EVENT,
  type PwaInstallPromptEvent,
} from '../../lib/pwa';

/**
 * A calm, user-initiated installation control. Browsers that own the install UI
 * receive their native prompt; iPhone and iPad receive the platform's manual path.
 */
export default function InstallAether() {
  const [deferredPrompt, setDeferredPrompt] = useState<PwaInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateInstalledState = () => setIsInstalled(isStandaloneMode(navigator, mediaQuery.matches));
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as PwaInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    setIsIos(isIosDevice(navigator));
    updateInstalledState();
    window.addEventListener(PWA_INSTALL_EVENT, onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    mediaQuery.addEventListener('change', updateInstalledState);

    return () => {
      window.removeEventListener(PWA_INSTALL_EVENT, onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      mediaQuery.removeEventListener('change', updateInstalledState);
    };
  }, []);

  if (isInstalled || (!deferredPrompt && !isIos)) {
    return null;
  }

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
      return;
    }

    setShowIosInstructions(true);
  };

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--theme-border)] bg-white px-3 py-2 text-sm font-bold text-[color:var(--theme-primary-strong)] shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--theme-primary)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--theme-primary)]"
      >
        <span aria-hidden="true">↓</span>
        Install Aether
      </button>
      <p className="mt-2 text-xs leading-5 text-[color:var(--theme-text-muted)]">Keep a calm support space one tap away.</p>

      {showIosInstructions ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-aether-title"
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4"
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
            <p className="theme-kicker">Install on iPhone or iPad</p>
            <h2 id="install-aether-title" className="mt-2 font-display text-2xl font-extrabold text-[color:var(--theme-text)]">
              Add Aether to your Home Screen
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              <li>Open this page in Safari.</li>
              <li>Select the Share button in the browser toolbar.</li>
              <li>Choose “Add to Home Screen,” then select Add.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="theme-button theme-button-primary mt-6 w-full justify-center"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
