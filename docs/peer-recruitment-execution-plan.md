# Peer Recruitment Implementation Execution Plan

Status: execution plan  
Last updated: 2026-07-05  
Owner: product engineering  
Source specification: [Peer Recruitment Operating Specification](./peer-recruitment-operating-spec.md)

## 1. Delivery Objectives

1. Move from hardcoded peer supply to managed lifecycle-based peer supply.
2. Ship foundational APIs and data contracts for recruitment and activation.
3. Add admin operational queues for screening, verification, and incidents.
4. Enable quality, fairness, and reliability observability.
5. Roll out constrained recruitment optimization in safe phases.

## 2. Phase Plan (12 Weeks)

### Phase 0: Foundations (Weeks 1-2)

Scope:

- Canonical peer candidate and lifecycle schema.
- Peer directory module abstraction and repository interface.
- Initial read APIs for peers and lifecycle status.
- Event envelope and audit event writer scaffold.

Deliverables:

- `PeerCandidate`, `PeerProfile`, `LifecycleState` types.
- `/api/peer-recruitment/peers` read endpoint.
- Structured event contract v1.
- Architecture decision records for data store and queue.

Acceptance:

- Matching reads peers through directory interface, not embedded arrays.
- API contract tests for peer listing pass.
- Zero TypeScript errors and baseline tests green.

Estimate:

- 2 engineers, 2 weeks.

### Phase 1: Lifecycle and Operations (Weeks 3-5)

Scope:

- Screening, training, verification, activation transitions.
- Admin queues and manual decision workflow.
- Hold/suspend/retire safety controls.

Deliverables:

- Lifecycle transition engine with invariant checks.
- Queue APIs and admin UI surfaces.
- Audit logs for all transitions.

Acceptance:

- Illegal transitions blocked with explicit error codes.
- Manual activation flow works end to end.
- Incident hold blocks activation.

Estimate:

- 3 engineers, 3 weeks.

### Phase 2: Reliability and Governance (Weeks 6-8)

Scope:

- Capacity and reliability metrics integration.
- Incident triage SLAs and ownership workflow.
- Fairness and exposure monitoring dashboards.

Deliverables:

- Capacity service and load shedding logic.
- Reliability score computation pipeline.
- Fairness and operations dashboards.

Acceptance:

- Capacity constraints enforced for active peers.
- Queue SLA alerts active.
- Fairness threshold alerts active.

Estimate:

- 2 engineers, 3 weeks.

### Phase 3: Planning and Optimization (Weeks 9-12)

Scope:

- Demand forecasting by segment.
- Recruitment target generation.
- Constrained optimizer in shadow mode, then assisted mode.

Deliverables:

- Target generation job and API.
- Optimizer service and comparison reports.
- Admin recommendation panel and override actions.

Acceptance:

- Weekly segment targets generated with confidence bands.
- Optimizer recommendations reproducible and auditable.
- Shadow/assisted mode rollback available.

Estimate:

- 3 engineers, 4 weeks.

## 3. Workstreams and Ownership

### Workstream A: Domain and API Contracts

Owner: backend engineer  
Support: frontend engineer

Tasks:

- Define canonical types and request/response contracts.
- Version schemas and validate backward compatibility.
- Add standardized error contract and correlation IDs.

### Workstream B: Admin Operations UX

Owner: frontend engineer  
Support: product designer

Tasks:

- Build queue-based admin pages.
- Implement lifecycle action controls and review details.
- Provide audit trace visibility per peer.

### Workstream C: Safety and Governance

Owner: trust and safety lead  
Support: backend engineer

Tasks:

- Encode hard gates and incident policies.
- Define severity SLAs and escalation procedures.
- Build compliance-friendly evidence export paths.

### Workstream D: Analytics and Optimization

Owner: data engineer  
Support: backend engineer

Tasks:

- Define funnel and quality metrics.
- Build forecast and optimizer services.
- Validate optimization against fairness and safety constraints.

## 4. Milestones

1. M1: Directory abstraction and peers API live (end of Week 2).
2. M2: Lifecycle transitions and admin queue MVP live (end of Week 5).
3. M3: Reliability, fairness, and incident dashboards live (end of Week 8).
4. M4: Optimizer shadow mode complete (end of Week 10).
5. M5: Optimizer assisted mode launch (end of Week 12).

## 5. Technical Task Breakdown

### 5.1 Data and Contracts

- Add `peer-recruitment/types.ts` canonical models.
- Add schema validators for all write APIs.
- Add API contract tests and schema snapshots.

### 5.2 Backend and Storage

- Implement peer repository with migration-safe interface.
- Introduce lifecycle transition transaction boundaries.
- Add idempotency keys on write endpoints.

### 5.3 Frontend and Admin

- Add `Admin Peer Directory` navigation and page.
- Build queue cards for screening/verification/incident states.
- Add bulk actions for capacity updates.

### 5.4 Observability

- Structured logs with `programId`, `peerId`, `transition`.
- Traces for lifecycle write paths.
- Alert rules for SLA and fairness breach.

### 5.5 Performance

- Read model for low-latency queue views.
- Background jobs for forecast and optimizer workloads.
- Caching policy for non-sensitive summary views.

## 6. Risks and Mitigations

1. Risk: Policy ambiguity delays implementation.
   Mitigation: lock minimum policy profile for pilot and version it.
2. Risk: Over-automation before governance maturity.
   Mitigation: run optimizer in shadow mode first.
3. Risk: Data model churn creates API instability.
   Mitigation: versioned contracts and compatibility tests.
4. Risk: Operational queue overload.
   Mitigation: staffing model, SLA alerts, and bulk actions.

## 7. Definition of Done

Feature done when all conditions are true:

- Functional: lifecycle and policy behavior meets acceptance criteria.
- Quality: tests pass (unit, integration, contract), no critical defects open.
- Reliability: SLOs instrumented and dashboards available.
- Governance: audit evidence and incident workflows operational.
- Security: access controls and sensitive field handling validated.

## 7.1 Operations Runbook

- Admin RBAC rollout and key-rotation procedure: [Admin RBAC Rollout Runbook](./admin-rbac-rollout-runbook.md).

## 8. Immediate Next Sprint (Implementation Start)

Sprint goals:

1. Create peer directory module and remove embedded peer array from matching logic.
2. Ship read-only peers API endpoint under `/api/peer-recruitment/peers`.
3. Add baseline contract tests for peers API.
4. Add initial peer lifecycle type scaffolding.

Sprint estimate:

- 1-2 engineers, 5 days.

Exit criteria:

- Peer list consumed through shared module.
- API endpoint responds with stable contract.
- Existing peer navigator matching behavior unchanged.

## 9. Async Worker Operations (Implemented)

- Queue storage: `.data/peer-recruitment-worker-queue.json` (configurable via `PEER_RECRUITMENT_WORKER_QUEUE_PATH`).
- Job types:
   - `refresh_forecast`
   - `refresh_fairness`
   - `incident_sla_check`
- Endpoints:
   - `POST /api/peer-recruitment/workers/jobs`
   - `GET /api/peer-recruitment/workers/jobs`
   - `POST /api/peer-recruitment/workers/run`
   - `GET /api/peer-recruitment/workers/run` (cron-friendly)
- Security option: set `PEER_RECRUITMENT_WORKER_API_KEY` and provide either `x-worker-key` or `Authorization: Bearer <key>`.
- Scheduler wiring:
   - `vercel.json` cron invokes `/api/peer-recruitment/workers/run?limit=25` every 10 minutes.
   - Generic fallback: `npm --workspace=apps/frontend run workers:run:once`.
