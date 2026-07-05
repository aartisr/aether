<!-- markdownlint-disable MD013 -->

# Peer Recruitment Feature Tracker

Status: living tracker  
Last updated: 2026-07-05

Legend:

- `FULL`: implemented and validated in current codebase.
- `PARTIAL`: implemented scaffold or subset, needs follow-up for production completeness.
- `REMAINING`: not implemented yet.

## 1. Current Delivery Status

| Feature Area | Status | Notes |
| --- | --- | --- |
| Canonical recruitment domain types | FULL | Lifecycle, readiness states, incidents, and audit event types exist. |
| Persistence driver abstraction | FULL | Store uses pluggable persistence interface with file and memory adapters. |
| Peer directory abstraction | FULL | Peer data moved to shared directory module consumed by matching logic. |
| Read peers API (`GET /api/peer-recruitment/peers`) | FULL | Returns canonical recruitment records from persistent store. |
| Peer record CRUD (admin + API) | FULL | Create, read, update, and delete peer records supported with validation and audit trails. |
| Lifecycle invariants (activate/pause/suspend) | FULL | Transition guardrails enforced via lifecycle module. |
| Readiness transitions (screening/training/verification) | FULL | Admin and API transition flows implemented with policy checks. |
| Incident open/suspend workflow | FULL | Opening incident creates case and suspends peer. |
| Incident resolution workflow | FULL | Resolves case and optionally restores peer to paused state. |
| Audit event capture | FULL | Lifecycle/readiness/incident events persisted to JSONL audit log. |
| Audit query API (`GET /api/peer-recruitment/audit/events`) | FULL | Supports filtering by event type, peer, actor. |
| Audit export API (`GET /api/peer-recruitment/audit/export`) | FULL | CSV export for filtered audit events. |
| Admin Peer Directory page | FULL | Includes lifecycle controls and queue summary. |
| Admin readiness queues | FULL | Screening/training/verification queue counts and controls implemented. |
| Admin incident queue | FULL | Open incident list and resolve controls implemented. |
| Admin audit review page | FULL | Filterable audit table and export link implemented. |
| API contract tests for new endpoints | FULL | Route-level contract suite added for peer, lifecycle, incident, and audit APIs. |
| End-to-end admin workflow tests | FULL | Automated workflow test covers suspend -> incident open -> resolve -> reactivate path. |
| Fine-grained RBAC | FULL | Reviewer/operator/owner roles now enforced across admin pages and actions. |
| Persistent database backend | FULL | Postgres repository implemented with schema/table bootstrap and JSONB persistence. |
| Background workers and queue infra | FULL | Persisted worker queue + processing endpoints implemented for recruitment jobs. |
| Periodic scheduler wiring for workers | FULL | Vercel cron configured to run worker endpoint every 10 minutes with API-key auth option. |
| Forecasting and optimizer services | FULL | Live capacity forecast + constrained action planner implemented and exposed in admin/API. |
| Fairness dashboard integration for recruitment funnel | FULL | Fairness governance page now reads recruitment lifecycle + incident + audit data. |
| RBAC rollout validation tooling | FULL | Runbook + executable env validation script for owner/operator/reviewer key policy checks. |

## 2. What Is Fully Implemented (Code Pointers)

- Domain and lifecycle types:
  - `apps/frontend/src/lib/peer-recruitment/types.ts`
  - `apps/frontend/src/lib/peer-recruitment/lifecycle.ts`
- Persistence and workflows:
  - `apps/frontend/src/lib/peer-recruitment/store.ts`
- Peer data abstraction:
  - `apps/frontend/src/lib/peer-directory/peer-navigator-directory.ts`
- APIs:
  - `apps/frontend/src/app/api/peer-recruitment/peers/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/activate/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/pause/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/suspend/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/screening/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/training/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/peers/[peerId]/verification/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/incidents/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/incidents/[caseId]/resolve/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/audit/events/route.ts`
  - `apps/frontend/src/app/api/peer-recruitment/audit/export/route.ts`
- Admin surfaces:
  - `apps/frontend/src/app/admin/peers/page.tsx`
  - `apps/frontend/src/app/admin/peers/actions.ts`
  - `apps/frontend/src/app/admin/peers/audit/page.tsx`
  - `apps/frontend/src/lib/peer-recruitment/peer-records.ts`

## 3. Remaining Priorities

1. No known code-level gaps for peer recruitment feature scope in this tracker.
2. Continue routine operational validation during deployment and key rotation.
