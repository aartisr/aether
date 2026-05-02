import type { MatchAttributes, MatchProfile, MatchProfileAdapter } from "./types";

export function createMatchProfileAdapter<TEntity, TAttributes extends object = MatchAttributes>(
  adapter: MatchProfileAdapter<TEntity, TAttributes>
) {
  return adapter;
}

export function toMatchProfile<TEntity, TAttributes extends object = MatchAttributes>(
  entity: TEntity,
  adapter: MatchProfileAdapter<TEntity, TAttributes>
): MatchProfile<TAttributes> {
  if (typeof adapter === "function") {
    return adapter(entity);
  }

  return {
    id: adapter.id(entity),
    attributes: adapter.attributes(entity),
    isAvailable: adapter.isAvailable?.(entity),
    capacity: adapter.capacity?.(entity) ?? undefined,
  };
}

export function toMatchProfiles<TEntity, TAttributes extends object = MatchAttributes>(
  entities: TEntity[],
  adapter: MatchProfileAdapter<TEntity, TAttributes>
) {
  return entities.map((entity) => toMatchProfile(entity, adapter));
}
