import type { BanditStore } from "./types";

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function normalizeCapacity(value: number | null | undefined, fallback = 1) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

export function stablePairId(aId: string, bId: string) {
  return aId < bId ? `${aId}::${bId}` : `${bId}::${aId}`;
}

export function createEmptyBanditStore(): BanditStore {
  return { byPairId: {} };
}

export function cloneBanditStore(store: BanditStore = createEmptyBanditStore()) {
  return {
    byPairId: Object.fromEntries(
      Object.entries(store.byPairId).map(([pairId, arm]) => [
        pairId,
        {
          alpha: arm.alpha,
          beta: arm.beta,
          seen: arm.seen,
        },
      ])
    ),
  };
}
