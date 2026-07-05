# Peer Recruitment Operating Specification

Status: implementation specification  
Last updated: 2026-07-05  
Audience: product, engineering, trust and safety, program operations, analytics, compliance

## 1. Purpose

Define a production-grade, modular, and reusable system for recruiting, qualifying, activating, and sustaining peer navigators for Aether Peer Navigator.

This specification focuses on:

- High quality peer supply that improves match outcomes.
- Strong safety and governance controls before peer activation.
- Configurable, multi-program operation without code forks.
- Measurable reliability, fairness, and performance at scale.

## 2. Scope and Non-Goals

### 2.1 In Scope

- Candidate acquisition and source tracking.
- Screening, training, verification, activation, and pause/retire lifecycle.
- Capacity and reliability controls.
- Recruitment optimization and demand forecasting.
- Admin operations and policy controls.
- Safety escalation and incident handling.
- Data contracts, APIs, telemetry, and quality gates.

### 2.2 Out of Scope

- Clinical diagnosis or treatment workflows.
- Storage of therapy notes or sensitive medical records by default.
- Legal determination automation.
- Region-specific legal policy text (must be configured per deployment).

## 3. Design Principles

1. Consent and safety before growth.
2. Hard gates before ranking or activation.
3. Progressive disclosure over survey overload.
4. Program-configurable behavior through policy and config.
5. Explainable and auditable decisions at each lifecycle stage.
6. Separation of concerns across modules.
7. Fail-safe defaults and explicit fallback behavior.
8. Continuous learning with guardrails.

## 4. Operating Model

Peer recruitment is implemented as a lifecycle operating system, not a single intake form.

Lifecycle states:

- prospect
- applied
- screened
- training_in_progress
- training_complete
- verification_pending
- verified
- active
- paused
- suspended
- retired

State transitions must be explicit, auditable, and policy-checked.

## 5. Modular Architecture

The system is split into independently deployable modules with strict contracts.

### 5.1 Modules

1. Acquisition Service
- Tracks lead sources, campaigns, and referral channels.
- Deduplicates prospects.

2. Screening Service
- Runs eligibility checks and baseline risk checks.
- Produces a screening decision and rationale.

3. Training and Certification Service
- Assigns training tracks and records completion outcomes.
- Enforces expiry and re-certification windows.

4. Verification Service
- Executes program-defined trust checks.
- Supports manual approval and maker-checker review.

5. Activation and Capacity Service
- Controls who enters active pool.
- Applies dynamic capacity limits and cooldowns.

6. Supply Planner
- Forecasts demand gaps by cohort, modality, timezone, and topic.
- Generates recruitment targets.

7. Recruitment Optimizer
- Ranks prospects and channels using constrained objective functions.
- Enforces safety/fairness constraints.

8. Governance and Incident Service
- Handles reports, escalations, holds, and suspension workflows.
- Feeds quality signals into activation decisions.

9. Admin Console
- Unified UI for queues, approvals, metrics, and policy controls.

10. Telemetry and Experimentation Service
- Tracks funnel, quality, fairness, and reliability.
- Runs controlled experiments with rollback support.

### 5.2 Data Plane and Control Plane

- Data plane: event streams, entity stores, read models.
- Control plane: policies, thresholds, feature flags, model versions.

### 5.3 Integration Pattern

- Event-driven asynchronous backbone.
- Synchronous APIs only for user-facing reads/writes requiring immediate acknowledgment.

## 6. Canonical Domain Model

### 6.1 Entities

1. PeerCandidate
- candidateId
- programId
- source
- sourceAttribution
- contactSignals (minimal)
- lifecycleState
- createdAt, updatedAt

2. PeerProfile
- peerId
- candidateId
- roleIntent
- languages
- modalityPreferences
- timezone
- availabilityWindows
- topicsCanSupport
- topicsCannotSupport
- supportStyle
- optionalIdentityTags
- optionalLivedExperienceTags
- privacyVisibility

3. ScreeningDecision
- decisionId
- candidateId
- status (pass, hold, fail)
- reasons
- evaluatorType (rule, model, human)
- policyVersion
- timestamp

4. TrainingRecord
- recordId
- peerId
- curriculumVersion
- moduleOutcomes
- completionStatus
- expiresAt

5. VerificationRecord
- verificationId
- peerId
- checksRun
- status
- reviewerId
- reviewedAt

6. CapacityRecord
- peerId
- maxActiveMatches
- currentActiveMatches
- responseSlaHours
- burnoutRiskBand
- capacityStatus

7. ReliabilityMetrics
- peerId
- firstResponseP50
- firstResponseP95
- acceptanceRate
- noShowRate
- retentionRate
- riskEventsCount

8. IncidentCase
- caseId
- peerId
- severity
- status
- actionsTaken
- owner
- openedAt, closedAt

9. RecruitmentTarget
- targetId
- programId
- dimensionSet (topic, timezone, modality, cohort)
- requiredCount
- targetWindow

10. ChannelPerformance
- channelId
- costPerQualifiedPeer
- conversionByStage
- retentionByStage
- qualityIndex

### 6.2 Invariants

- active requires screening pass, training complete, verification pass.
- suspended peers cannot re-enter active without explicit review closure.
- capacity cannot go below zero or above policy maximum.
- every lifecycle transition emits an immutable event.

## 7. Recruitment Funnel Definition

Funnel stages:

1. prospect_seen
2. prospect_interested
3. application_started
4. application_submitted
5. screening_passed
6. training_started
7. training_completed
8. verification_passed
9. activated
10. retained_30d
11. retained_90d

Stage metrics:

- conversion rate
- time-to-stage
- drop-off reason distribution
- stage-level quality index contribution

## 8. Eligibility, Safety, and Governance Rules

### 8.1 Hard Gates

Mandatory gates before activation:

- consent and policy acceptance.
- program eligibility checks.
- required training completion.
- required verification completion.
- no unresolved severe incident hold.
- no active policy suspension.

### 8.2 Soft Signals

Used for ranking, not hard exclusion:

- response consistency trend.
- onboarding friction score.
- low-severity concern history.
- confidence of support-topic readiness.

### 8.3 Escalation Policy

Incident severity tiers:

- P0 immediate danger
- P1 high risk
- P2 moderate risk
- P3 low risk

Required SLA:

- P0 immediate routing to emergency/crisis protocol.
- P1 initial human review within 1 hour.
- P2 within 24 hours.
- P3 within 72 hours.

## 9. Optimization Strategy for Recruitment

### 9.1 Objective

Maximize expected supply value under constraints.

Supply value combines:

- demand coverage gain
- expected reliability
- expected retention
- safety confidence
- fairness contribution

### 9.2 Constraints

- safety thresholds (non-negotiable).
- fairness exposure and quality parity bands.
- budget caps.
- operational reviewer capacity.

### 9.3 Optimization Loop

1. Forecast shortages by segment.
2. Score candidates and channels by constrained marginal value.
3. Allocate outreach/training slots.
4. Measure outcomes and recalibrate.

## 10. Supply Forecasting

Forecast dimensions:

- topic
- language
- modality
- timezone
- program/cohort

Inputs:

- seeker demand trends
- historical acceptance/retention
- no-show and churn trends
- seasonal effects and campaign effects

Outputs:

- weekly recruitment targets by segment.
- confidence intervals and risk flags.

## 11. API Specification

### 11.1 Candidate and Lifecycle APIs

1. POST /api/peer-recruitment/candidates
- Create prospect or application.

2. GET /api/peer-recruitment/candidates/{candidateId}
- Fetch canonical candidate record.

3. POST /api/peer-recruitment/candidates/{candidateId}/screen
- Trigger screening decision.

4. POST /api/peer-recruitment/peers/{peerId}/training/complete
- Record training completion.

5. POST /api/peer-recruitment/peers/{peerId}/verify
- Submit verification result.

6. POST /api/peer-recruitment/peers/{peerId}/activate
- Activate peer if all hard gates pass.

7. POST /api/peer-recruitment/peers/{peerId}/pause
- Pause peer with reason.

8. POST /api/peer-recruitment/peers/{peerId}/suspend
- Suspend peer with policy case link.

9. POST /api/peer-recruitment/peers/{peerId}/retire
- Retire peer from pool.

### 11.2 Planning and Optimization APIs

1. GET /api/peer-recruitment/targets
- Retrieve segment-level recruitment targets.

2. POST /api/peer-recruitment/optimizer/run
- Run constrained allocation plan.

3. GET /api/peer-recruitment/channels/performance
- Return channel-level conversion and quality metrics.

### 11.3 Governance APIs

1. POST /api/peer-recruitment/incidents
- Open incident case.

2. POST /api/peer-recruitment/incidents/{caseId}/resolve
- Resolve case with actions.

3. GET /api/peer-recruitment/audit/events
- Paginated audit stream by entity and time.

### 11.4 API Error Contract

All APIs return standardized errors:

- errorCode
- message
- retryable
- correlationId
- details

Error classes:

- validation_error
- policy_violation
- state_transition_invalid
- dependency_failure
- timeout
- unauthorized
- forbidden

## 12. Event Schema

All state changes publish immutable events.

Core event envelope:

- eventId
- eventType
- entityType
- entityId
- programId
- actorType
- actorId
- timestamp
- schemaVersion
- payload

Key event types:

- candidate.created
- application.submitted
- screening.completed
- training.completed
- verification.completed
- peer.activated
- peer.paused
- peer.suspended
- peer.retired
- incident.opened
- incident.resolved
- capacity.updated

## 13. Admin Console Requirements

### 13.1 Queues

- Screening queue
- Verification queue
- Activation queue
- Incident queue
- Re-certification queue

### 13.2 Views

- Candidate funnel dashboard
- Segment supply coverage dashboard
- Reliability and response dashboard
- Fairness dashboard
- Policy exceptions dashboard

### 13.3 Actions

- Approve, hold, reject decisions
- Bulk capacity updates
- Pause/suspend/reactivate peer
- Assign case owner
- Export audit evidence

## 14. Quality, Reliability, and Performance SLOs

### 14.1 Availability

- Control APIs: 99.9 percent monthly.
- Read models: 99.95 percent monthly.

### 14.2 Latency

- p95 read API: under 250 ms.
- p95 write API ack: under 500 ms.
- optimizer plan generation p95: under 5 s for standard program scale.

### 14.3 Data Freshness

- event-to-read-model lag p95: under 30 s.

### 14.4 Correctness

- zero tolerance for hard-gate bypass defects.
- exactly-once effective state transitions via idempotency keys.

## 15. Security and Privacy Requirements

1. Data minimization and explicit purpose mapping.
2. Field-level sensitivity classification.
3. Encryption in transit and at rest.
4. Role-based access and least privilege.
5. Immutable audit trails for governance actions.
6. Retention and deletion policies by entity class.
7. Strict separation between matching fields and optional display fields.

## 16. Fairness and Bias Controls

Required metrics:

- exposure parity by eligible group
- quality parity by group
- activation parity
- adverse event parity

Policy controls:

- configurable fairness bands
- automatic alerting when thresholds breach
- rollback to safe policy profile

Human review:

- monthly fairness review board.
- documented decision logs for policy changes.

## 17. Testing Strategy

### 17.1 Unit Tests

- rule engine behavior
- lifecycle transition validator
- optimizer objective and constraints
- API request validation and error mapping

### 17.2 Contract Tests

- API schema compatibility
- event schema backward compatibility

### 17.3 Integration Tests

- end-to-end lifecycle from prospect to active
- incident suspend and reactivation flow
- queue processing idempotency

### 17.4 Property-Based Tests

- invariant preservation across random transition sequences
- no illegal state transitions

### 17.5 Performance Tests

- load tests for queue burst conditions
- optimizer scale tests
- read model fan-out tests

### 17.6 Chaos and Resilience Tests

- dependency outage fallback behavior
- replay and recovery correctness

## 18. Observability and Analytics

### 18.1 Required Dashboards

- funnel conversion dashboard
- supply gap dashboard
- queue SLA dashboard
- incident resolution dashboard
- fairness dashboard

### 18.2 Required Alerts

- hard-gate bypass detection
- queue SLA breach
- event lag breach
- sudden reliability degradation
- fairness threshold breach

### 18.3 Telemetry Standards

- correlationId propagated across modules
- structured logs with entity and program dimensions
- trace spans for all critical write flows

## 19. Configuration and Multi-Program Support

Configuration hierarchy:

- global defaults
- program-level overrides
- cohort-level overrides (optional)

Config domains:

- eligibility requirements
- training track requirements
- verification policy
- capacity policy
- fairness bands
- optimization weights
- SLA and alert thresholds

No hardcoded program behavior in service code.

## 20. Rollout Plan

### Phase 0: Foundations

- Implement schemas, lifecycle engine, and audit events.
- Launch admin queues without automation.

### Phase 1: Assisted Operations

- Enable screening automation with human override.
- Enable training and verification gates.

### Phase 2: Controlled Optimization

- Enable supply forecasting and recruitment targets.
- Run optimizer in shadow mode, compare with manual decisions.

### Phase 3: Automated Allocation with Guardrails

- Allow optimizer-assisted channel and candidate prioritization.
- Keep rollback and manual override always available.

## 21. Migration Path for Current Aether Implementation

Current state:

- Peer list is hardcoded in frontend demo logic.

Migration sequence:

1. Extract peer data into canonical store and repository interface.
2. Replace hardcoded peer array reads with PeerDirectoryProvider.
3. Add admin CRUD for peer lifecycle fields.
4. Introduce screening/training/verification checkpoints.
5. Add capacity and reliability telemetry.
6. Enable demand planning and optimizer endpoints.

## 22. Acceptance Criteria

Functional:

- Peer lifecycle transitions enforce all hard gates.
- Admin can complete full activation workflow without direct database edits.
- Recruitment targets generated per configured segment.

Quality:

- All lifecycle invariants proven by tests.
- No hard-gate bypass in test or staging.
- SLO dashboards and alerts active.

Operational:

- Queue SLA targets met in pilot.
- Incident workflow produces auditable case history.
- Fairness review artifacts generated monthly.

## 23. Open Decisions

1. Program-specific legal verification requirements by deployment region.
2. Minimum training curriculum and recertification period.
3. Fairness policy bands for pilot versus scale phases.
4. Budget governance model for channel optimization.
5. Human reviewer staffing model for verification and incidents.

## 24. Appendix A: Minimal JSON Examples

### 24.1 Candidate Create Request

```json
{
  "programId": "campus-a",
  "source": "referral",
  "roleIntent": "navigator",
  "timezone": "America/Chicago",
  "languages": ["en"],
  "modalityPreferences": ["chat", "video"],
  "consentVersion": "2026-07-01"
}
```

### 24.2 Screening Decision Event Payload

```json
{
  "candidateId": "cand_123",
  "status": "pass",
  "reasons": ["eligibility_ok", "policy_clear"],
  "policyVersion": "screening-v3",
  "timestamp": "2026-07-05T18:42:10.000Z"
}
```

### 24.3 Activation Request

```json
{
  "peerId": "peer_123",
  "programId": "campus-a",
  "maxActiveMatches": 3,
  "responseSlaHours": 24
}
```

## 25. Appendix B: Recommended Initial KPIs

- time-to-activate median
- 7-day activation retention
- first response within SLA
- no-show rate
- incident rate per 100 active peers
- coverage gap index by segment
- cost per verified active peer
- fairness exposure deviation
