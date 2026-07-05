# Peer Matching Benchmark Patterns (Top 25 Public Products)

Status: design reference
Last updated: 2026-07-05

## Purpose

This document summarizes reusable product and algorithm patterns inspired by 25 widely used public platforms across social matching, mentoring, community support, and trust/safety operations.

It is not a ranking claim and does not imply direct feature parity. It is a design benchmark map used to keep Peer Navigator generic, modular, and maintainable.

## 25 Reference Products

1. LinkedIn
2. Meetup
3. Discord
4. Reddit
5. Facebook Groups
6. Slack Communities
7. Nextdoor
8. Bumble BFF
9. Tinder
10. Hinge
11. OkCupid
12. Coffee Meets Bagel
13. ADPList
14. MentorCruise
15. GrowthMentor
16. Togetherall
17. 7 Cups
18. TalkLife
19. NAMI peer programs
20. Crisis Text Line volunteer network
21. Big Brothers Big Sisters
22. Mentor Collective
23. Coursera communities
24. GitHub Discussions
25. Stack Overflow Communities

## Reusable Pattern Map

### 1. Progressive onboarding (low cognitive load)

Observed in: LinkedIn, Bumble BFF, ADPList, MentorCruise, Togetherall.

Reusable rule:
- Ask only for fields required for the next decision.
- Keep advanced fields behind optional disclosure.

Implementation in Aether:
- `PeerNavigatorRequest` carries only immediate intent fields.
- Sensitive context remains optional and policy-gated in peer-network profiles.

### 2. Reciprocal relevance, not one-sided ranking

Observed in: Tinder, Hinge, OkCupid, Coffee Meets Bagel.

Reusable rule:
- Pair quality should reflect both participants, not just seeker preference.

Implementation in Aether:
- Reciprocal scoring in generic `peer-matching` engine.
- Phase 1 candidate generation with reciprocal floor.

### 3. Hard trust and policy gates before ranking

Observed in: Togetherall moderation, Crisis Text Line volunteer controls, Nextdoor trust boundaries.

Reusable rule:
- Remove unsafe candidates before optimization. Never rely on a soft penalty for hard risk.

Implementation in Aether:
- `hardPeerNetworkFilter` enforces training, verification, capacity, urgency routing, and boundary blocks.

### 4. Explainability for user trust

Observed in: LinkedIn People suggestions, ADPList mentor matching copy, Mentor Collective guidance.

Reusable rule:
- Explanations should be user-safe factors, not raw model internals.

Implementation in Aether:
- `explainPeerNetworkMatch` returns safe factor strings only.

### 5. Fairness and exposure balancing

Observed in: modern marketplace and recommender governance practices.

Reusable rule:
- Keep exposure parity and quality parity within configured policy bands.

Implementation in Aether:
- Phase 2 fairness rescoring with under-exposure boost and over-exposure penalty.

### 6. Reliability-aware supply management

Observed in: mentorship and volunteer networks.

Reusable rule:
- Respect capacity and response expectations to reduce silent failure.

Implementation in Aether:
- Navigator capacity and eligibility gates in `peer-network/matching-adapter.ts`.

### 7. Fallback routing for resilience

Observed in: support and marketplace systems with backup paths.

Reusable rule:
- If no quality match or urgent signal appears, route quickly to backup or crisis support.

Implementation in Aether:
- Request-level urgency triage in `runPeerNavigatorMatchRequest`.
- Crisis route to 988 for immediate danger.

## Generic Algorithm Contract

A reusable peer-matching contract should always include:

- Input profile adapter (domain object -> generic profile)
- Hard eligibility and safety gates
- Directed utility function
- Reciprocal score function
- Fairness policy configuration
- Exploration policy configuration
- Explanation strategy
- Outcome feedback hook

Current Aether implementation already follows this shape via:
- `apps/frontend/src/lib/peer-matching/*`
- `apps/frontend/src/lib/peer-network/*`

## Plug-and-Play Checklist

To reuse Peer Navigator matching in another domain:

1. Implement a new profile adapter only.
2. Define hard policy gates for the domain.
3. Replace goal/style taxonomies, keep engine unchanged.
4. Tune fairness config and quality floor.
5. Provide domain-safe explanation factors.
6. Keep UI flow to 3 to 4 required inputs max.

This keeps the engine generic while allowing domain-specific behavior at the adapter layer.
