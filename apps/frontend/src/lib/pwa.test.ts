import { canRegisterServiceWorker, isIosDevice, isStandaloneMode } from './pwa';

describe('PWA capability helpers', () => {
  it('recognizes standalone browser and iOS modes', () => {
    expect(isStandaloneMode({ standalone: true } as unknown as Navigator, false)).toBe(true);
    expect(isStandaloneMode({} as unknown as Navigator, true)).toBe(true);
    expect(isStandaloneMode({} as unknown as Navigator, false)).toBe(false);
  });

  it('recognizes iPhone and iPadOS user agents', () => {
    expect(isIosDevice({ userAgent: 'Mozilla/5.0 (iPhone)', platform: 'iPhone', maxTouchPoints: 1 })).toBe(true);
    expect(isIosDevice({ userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
    expect(isIosDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 14)', platform: 'Linux', maxTouchPoints: 0 })).toBe(false);
  });

  it('only registers a service worker in secure, supported contexts', () => {
    expect(canRegisterServiceWorker({ serviceWorker: {} } as Navigator, true)).toBe(true);
    expect(canRegisterServiceWorker({} as Navigator, true)).toBe(false);
    expect(canRegisterServiceWorker({ serviceWorker: {} } as Navigator, false)).toBe(false);
  });
});
