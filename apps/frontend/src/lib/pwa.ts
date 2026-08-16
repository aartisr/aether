export const PWA_INSTALL_EVENT = 'beforeinstallprompt';

export type PwaInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function isStandaloneMode(navigatorValue: NavigatorWithStandalone, displayModeMatches: boolean) {
  return displayModeMatches || navigatorValue.standalone === true;
}

export function isIosDevice(navigatorValue: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>) {
  return /iPad|iPhone|iPod/i.test(navigatorValue.userAgent) ||
    (navigatorValue.platform === 'MacIntel' && navigatorValue.maxTouchPoints > 1);
}

export function canRegisterServiceWorker(navigatorValue: Navigator, isSecure: boolean) {
  return isSecure && 'serviceWorker' in navigatorValue;
}
