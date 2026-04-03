# Peer Matching Service Contracts

## 1. Purpose

This document defines implementation-ready API contracts and TypeScript interfaces for the Reciprocal Constrained Stable Matching (RCSM) design in [docs/peer-matching-algorithm.md](docs/peer-matching-algorithm.md).

Use this as the canonical interface spec between frontend (`Peer Navigator`) and matching backend services.

---

## 2. Service Boundaries

Recommended services:

- `matching-api`: request orchestration, policy checks, response composition.
- `matching-engine`: candidate generation, scoring, solver, stability refinement.
- `safety-policy`: hard gate evaluation.
- `match-events`: event ingestion and analytics.

Initial deployment can combine these into one service, but interfaces should remain stable.

---

## 3. API Overview

### 3.1 Endpoints

1. `POST /api/peer-matching/v1/suggestions`
   - Returns match suggestions for a requesting user.

2. `POST /api/peer-matching/v1/accept`
   - Confirms user acceptance of a suggestion.

3. `POST /api/peer-matching/v1/reject`
   - Rejects a suggestion with reason code.

4. `POST /api/peer-matching/v1/events`
   - Ingests lifecycle and quality events.

5. `GET /api/peer-matching/v1/health`
   - Service liveness and policy version status.

### 3.2 Error model

Use structured errors:

```json
{
  "error": {
    "code": "POLICY_BLOCKED",
    "message": "Matching is temporarily unavailable for this account.",
    "retryable": false,
    "requestId": "req_01HXYZ..."
  }
}
```

Common codes:

- `INVALID_REQUEST`
- `UNAUTHORIZED`
- `POLICY_BLOCKED`
- `NO_CANDIDATES`
- `ENGINE_TIMEOUT`
- `INTERNAL_ERROR`

---

## 4. TypeScript Contracts

```ts
export type ISODateTime = string;

export type MatchMode = "primary-only" | "primary-with-backup";

export type Modality = "text" | "voice" | "video";

export type RejectionReason =
  | "not_relevant"
  | "timing_mismatch"
  | "language_mismatch"
  | "prefer_different_topic"
  | "other";

export interface AvailabilityWindow {
  start: ISODateTime;
  end: ISODateTime;
}

export interface UserMatchContext {
  userId: string;
  timezone: string;
  languages: string[];
  availability: AvailabilityWindow[];
  goalTags: string[];
  backgroundTags?: string[];
  experienceTags?: string[];
  preferredModalities?: Modality[];
  allowSerendipity?: boolean;
  capacity?: number;  // NEW: Multi-match support. Default: 1 (1:1 matching). Set to >1 for group/multi-peer scenarios.
}

export interface MatchSuggestionRequest {
  context: UserMatchContext;
  mode?: MatchMode;
  limit?: number;
  requestId?: string;
}

export interface MatchExplanation {
  topFactors: string[];
  confidence: number; // 0..1
  fairnessAdjusted?: boolean;
}

export interface MatchPeerSummary {
  peerId: string;
  displayName: string;
  languages: string[];
  modality: Modality;
  overlapMinutes: number;
}

export interface MatchSuggestion {
  suggestionId: string;
  cycleId: string;
  rank: number;
  score: number;
  kind: "primary" | "backup";
  peer: MatchPeerSummary;
  explanation: MatchExplanation;
  expiresAt: ISODateTime;
}

export interface MatchSuggestionResponse {
  requestId: string;
  policyVersion: string;
  engineVersion: string;
  generatedAt: ISODateTime;
  suggestions: MatchSuggestion[];
}

export interface MatchDecisionRequest {
  suggestionId: string;
  userId: string;
  requestId?: string;
}

export interface MatchAcceptResponse {
  requestId: string;
  conversationId: string;
  matchedPeerId: string;
  acceptedAt: ISODateTime;
}

export interface MatchRejectRequest extends MatchDecisionRequest {
  reason: RejectionReason;
  notes?: string;
}

export interface MatchRejectResponse {
  requestId: string;
  rejectedAt: ISODateTime;
  nextEligibleAt?: ISODateTime;
}

export type MatchEventType =
  | "suggestion_shown"
  | "suggestion_accepted"
  | "suggestion_rejected"
  | "conversation_started"
  | "first_response"
  | "conversation_ended"
  | "rematch_requested"
  | "safety_flag";

export interface MatchEvent {
  eventId: string;
  eventType: MatchEventType;
  userId: string;
  peerId?: string;
  suggestionId?: string;
  conversationId?: string;
  timestamp: ISODateTime;
  metadata?: Record<string, string | number | boolean>;
}

export interface MatchEventsIngestRequest {
  requestId?: string;
  events: MatchEvent[];
}

export interface MatchEventsIngestResponse {
  requestId: string;
  accepted: number;
  rejected: number;
}

export interface PolicyCheckOutput {
  decision: PolicyDecision;
  reasonCodes: string[];
  riskPenalty?: number;
  policyVersion: string;
}
```

---

## 4.1 Production Enhancement Contracts (NEW)

Enhanced configuration interfaces for capacity, fairness, and determinism:

```ts
// NEW: Phase 1 Configuration with Quality Floor
export interface Phase1Config {
  minReciprocalScore?: number;  // Quality floor (0..1). Filter candidates below this threshold.
}

// NEW: Phase 2 Configuration with Incidence-Gap Fairness
export interface FairnessConfig {
  underExposureBoost?: number;  // Boost multiplier for under-exposed cohorts (e.g., 0.5).
  overExposurePenalty?: number;  // Penalty multiplier for over-exposed cohorts (e.g., 0.6).
}

export interface Phase2Config {
  fairnessConfig?: FairnessConfig;
  maxStabilityIterations?: number;  // Max iterations for blocking-pair refinement (default: 50).
}

// NEW: Phase 3 Configuration with Determinism
export interface Phase3Config {
  explorationWeight?: number;  // Thompson sampling exploration weight (0..1, default 0.2).
  uncertaintyWeight?: number;  // Posterior uncertainty contribution (0..1, default 0.1). NEW: Independent from explorationWeight.
  rng?: () => number;  // Optional seeded RNG function (Uint32 -> [0,1)).
  rngSeed?: number;  // Optional seed for deterministic exploration (enables reproducible simulations).
}

// NEW: Cycle Metrics
export interface MatchCycleMetrics {
  totalProfiles: number;        // Eligible users in cycle.
  totalCandidates: number;      // Candidate edges generated (before filtering).
  totalFinalAssignments: number;  // Finalized matches (after all phases, respecting capacity).
  averageFinalScore: number;    // Mean score across final assignments.
}

export interface MatchCycleOutput {
  assignments: MatchAssignment[];
  metrics: MatchCycleMetrics;
}

// Updated internal engine contracts with capacity awareness and metrics
export interface PairScore {
  userA: string;
  userB: string;
  directedAtoB: number;
  directedBtoA: number;
  reciprocal: number;
  composite: number;
  risk: number;
  phase1Score?: number;  // NEW: Reciprocal score with minReciprocalScore floor applied.
  phase2Score?: number;  // NEW: Fairness-adjusted score (after incidence-gap analysis).
  phase3Score?: number;  // NEW: Thompson sampling reranked score.
}

export interface SolverConstraintConfig {
  maxMatchesPerUser: number;
  maxMultiMatchCapacity?: Record<string, number>;  // NEW: Per-user capacity (defaults to 1).
  fairnessExposureBand?: number;
  disallowRecentPairWithinHours?: number;
  timeoutMs: number;
}

export interface SolverOutput {
  cycleId: string;
  assignments: SolverAssignment[];
  feasible: boolean;
  objectiveValue: number;
  timedOut: boolean;
  metrics?: MatchCycleMetrics;  // NEW: Cycle-level statistics.
}

// Enhanced match explanation with fairness audit trail
export interface MatchExplanation {
  topFactors: string[];
  confidence: number; // 0..1
  fairnessAdjusted?: boolean;
  fairnessAdjustmentMagnitude?: number;  // NEW: How much fairness changed the score (-1..1).
  phaseScores?: {  // NEW: Raw scores from each phase (for audit).
    phase1?: number;
    phase2?: number;
    phase3?: number;
  };
}
```

---

## 5. Request/Response Examples

### 5.1 Suggestion request (with multi-capacity support)

```json
{
  "context": {
    "userId": "u_123",
    "timezone": "America/Los_Angeles",
    "languages": ["en"],
    "availability": [
      {
        "start": "2026-04-03T18:00:00Z",
        "end": "2026-04-03T19:00:00Z"
      }
    ],
    "goalTags": ["stress", "career-support"],
    "preferredModalities": ["text"],
    "capacity": 2
  },
  "mode": "primary-with-backup",
  "limit": 2
}
```

### 5.2 Suggestion response (with metrics and fairness audit trail)

```json
{
  "requestId": "req_0a7f",
  "policyVersion": "policy_2026_04_03",
  "engineVersion": "rcsm_2.0.0",
  "generatedAt": "2026-04-03T18:00:01Z",
  "cycleMetrics": {
    "totalProfiles": 247,
    "totalCandidates": 1240,
    "totalFinalAssignments": 118,
    "averageFinalScore": 0.74
  },
  "suggestions": [
    {
      "suggestionId": "sug_1",
      "cycleId": "cyc_778",
      "rank": 1,
      "score": 0.87,
      "kind": "primary",
      "peer": {
        "peerId": "u_501",
        "displayName": "A. Peer",
        "languages": ["en"],
        "modality": "text",
        "overlapMinutes": 45
      },
      "explanation": {
        "topFactors": [
          "Shared goals: stress, career-support",
          "High historical response reliability",
          "Strong schedule overlap"
        ],
        "confidence": 0.79,
        "fairnessAdjusted": true,
        "fairnessAdjustmentMagnitude": 0.06,
        "phaseScores": {
          "phase1": 0.82,
          "phase2": 0.85,
          "phase3": 0.87
        }
      },
      "expiresAt": "2026-04-03T18:05:01Z"
    }
  ]
}
```

---

## 6. Engine Internal Interfaces

```ts
export interface CandidateEdge {
  fromUserId: string;
  toUserId: string;
  featureVector: number[];
  hardCompatible: boolean;
  hardSafe: boolean;
}

export interface PairScore {
  userA: string;
  userB: string;
  directedAtoB: number;
  directedBtoA: number;
  reciprocal: number;
  composite: number;
  risk: number;
}

export interface SolverConstraintConfig {
  maxMatchesPerUser: number;
  fairnessExposureBand?: number;
  disallowRecentPairWithinHours?: number;
  timeoutMs: number;
}

export interface SolverInput {
  cycleId: string;
  users: string[];
  pairScores: PairScore[];
  constraints: SolverConstraintConfig;
}

export interface SolverAssignment {
  userA: string;
  userB: string;
  score: number;
}

export interface SolverOutput {
  cycleId: string;
  assignments: SolverAssignment[];
  feasible: boolean;
  objectiveValue: number;
  timedOut: boolean;
}
```

---

## 7. Safety and Policy Interfaces

```ts
export type PolicyDecision = "allow" | "block" | "allow_with_penalty";

export interface PolicyCheckInput {
  userA: string;
  userB: string;
  context: Record<string, string | number | boolean>;
}

export interface PolicyCheckOutput {
  decision: PolicyDecision;
  reasonCodes: string[];
  riskPenalty?: number;
  policyVersion: string;
}
```

Rules:

- `block` removes edge.
- `allow_with_penalty` keeps edge and applies bounded penalty.
- All reason codes must be auditable.

---

## 8. Observability Contract

All APIs must attach:

- `requestId`
- `cycleId` (where applicable)
- `policyVersion`
- `engineVersion`

Minimum counters:

- `matching_requests_total`
- `matching_suggestions_total`
- `matching_accept_total`
- `matching_reject_total`
- `matching_no_candidate_total`
- `matching_policy_block_total`
- `matching_solver_timeout_total`

Minimum latency histograms:

- `matching_request_latency_ms`
- `matching_solver_latency_ms`
- `matching_policy_latency_ms`

---

## 9. State and Idempotency Requirements

- `POST /suggestions` should be idempotent by `(requestId, userId, time-bucket)`.
- Accept/reject operations must reject stale or expired `suggestionId`.
- Event ingest should dedupe by `eventId`.

---

## 10. Security and Privacy Requirements

- Never return sensitive fairness attributes in API responses.
- Encrypt policy-sensitive fields at rest.
- Redact safety reason details in user-visible messages.
- Enforce least-privilege access between services.

---

## 11. Frontend Integration Notes

For `Peer Navigator` UI behavior:

1. Request suggestions on explicit user action (`Find My Peer`).
2. Show at most one primary and one backup (or more if `capacity` > 1).
3. Show explanation factors, not raw scores. Include fairness adjustment magnitude if adjusted.
4. Display phase scores in audit/details view (for transparency).
5. Auto-refresh suggestions if `expiresAt` passes.
6. Send `suggestion_shown`, then accept/reject and follow-on events.
7. **NEW**: Display cycle metrics in analytics dashboard (totalProfiles, totalFinalAssignments, averageFinalScore).
8. **NEW**: Allow users to specify `capacity > 1` in preferences for group/multi-peer scenarios (if policy permits).

---

## 12. Versioning

- API path is versioned (`/v1`).
- Any breaking schema change requires `/v2`.
- `policyVersion` and `engineVersion` are mandatory for auditability.
