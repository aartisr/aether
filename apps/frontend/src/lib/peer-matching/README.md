# Matching Engine

The matching engine is domain-agnostic. It knows how to:

1. Generate reciprocal candidates.
2. Apply hard gates and directed scoring supplied by the caller.
3. Refine ranking with fairness and stability policies.
4. Apply bounded exploration from outcome history.
5. Return assignments, candidate scores, reasons, and cycle metrics.

It does not know what a peer navigator, mentor, student, service provider, or resource is. Domain rules live in adapters and config.

## Generic Usage

```ts
import { createEntityMatchingEngine } from "../peer-matching";

const engine = createEntityMatchingEngine({
  adapter: {
    id: (person) => person.id,
    isAvailable: (person) => person.status === "active",
    capacity: (person) => person.remainingCapacity,
    attributes: (person) => ({
      role: person.role,
      goals: person.goals,
      canSupport: person.canSupport,
    }),
  },
  phase1: {
    hardFilter: (source, target) =>
      source.attributes.role === "seeker" && target.attributes.role === "navigator",
    directedScore: (source, target) =>
      source.attributes.goals.some((goal) => target.attributes.canSupport.includes(goal)) ? 0.95 : 0.2,
  },
});

const output = engine.match(participants, { maxAssignments: 3 });
```

## Peer-Navigator Usage

Use `../peer-network/matching-adapter` for the Peer-Navigator plan. That adapter keeps product-specific rules out of the generic engine:

- immediate-danger seekers are routed away from peer matching;
- only active, trained, verified navigators with capacity are eligible;
- language, modality, availability, blocked-participant, and topic-exclusion gates run before scoring;
- explanation factors are safe user-facing phrases, not raw scores or sensitive tags.

```ts
import { createPeerNetworkMatchingEngine } from "../peer-network";

const engine = createPeerNetworkMatchingEngine();
const output = engine.match(peerNetworkProfiles);
```

## Backward Compatibility

`createPeerMatchingEngine` remains available as an alias for the original demo code. New code should prefer:

- `createMatchingEngine` when data is already in `MatchProfile` form.
- `createEntityMatchingEngine` when matching arbitrary domain records.
- `createPeerNetworkMatchingEngine` for the Peer-Navigator Network product flow.
