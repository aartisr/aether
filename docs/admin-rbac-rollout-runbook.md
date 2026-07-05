# Admin RBAC Rollout Runbook

Status: operational runbook  
Last updated: 2026-07-05  
Scope: admin authentication and authorization for reviewer/operator/owner roles

## 1. Purpose

This runbook describes how to roll out and operate role-based admin access in Aether with minimal risk.

## 2. Role Model

- reviewer: read access for audit and feedback workflows.
- operator: reviewer access plus peer lifecycle and incident operations.
- owner: full access including CMS and page-control features.

## 3. Environment Configuration

Required variables:

- AETHER_ENABLE_ADMIN_PAGE=true
- AETHER_ADMIN_SESSION_SECRET=<strong random secret>
- AETHER_ADMIN_SESSION_TTL_MINUTES=240
- AETHER_ADMIN_OWNER_KEYS=<comma-separated keys>
- AETHER_ADMIN_OPERATOR_KEYS=<comma-separated keys>
- AETHER_ADMIN_REVIEWER_KEYS=<comma-separated keys>

Optional backward-compatibility variables:

- AETHER_ADMIN_ACCESS_KEY
- AETHER_ADMIN_ACCESS_KEYS

Note: legacy keys are treated as owner keys.

## 4. Pre-Production Checklist

1. Generate role-specific keys in your secret manager.
2. Set admin session secret to a high-entropy value.
3. Configure at least one key per role.
4. Verify role path restrictions in staging:
   - reviewer denied for /admin/page-controls and /admin/cms
   - operator denied for /admin/page-controls and /admin/cms
   - owner has access to all admin routes
5. Validate sign-in, sign-out, and session expiry behavior.
6. Run frontend typecheck and tests:
   - npm --workspace=apps/frontend run admin:rbac:validate
   - npm --workspace=apps/frontend run typecheck
   - npm --workspace=apps/frontend test -- admin-auth.test.ts

## 5. Rollout Steps (Production)

1. Deploy code with RBAC support.
2. Apply environment variables for all roles.
3. Restart deployment targets.
4. Perform smoke login for each role account/key.
5. Confirm role-appropriate landing destinations:
   - reviewer -> /admin/peers/audit
   - operator -> /admin/peers
   - owner -> /admin/page-controls
6. Announce go-live to operations and trust/safety stakeholders.

## 6. Key Rotation Procedure

1. Add new keys for each role alongside existing keys.
2. Distribute new keys through approved channels.
3. Verify successful login for each role using new keys.
4. Remove old keys from environment variables.
5. Redeploy and validate login paths again.

Recommended cadence:

- rotate quarterly
- rotate immediately on staffing changes or suspected compromise

## 7. Incident Response

If unauthorized admin access is suspected:

1. Remove compromised keys from all role key variables.
2. Rotate AETHER_ADMIN_SESSION_SECRET to invalidate all sessions.
3. Redeploy immediately.
4. Review audit exports for suspicious changes:
   - /api/peer-recruitment/audit/export
5. Re-issue new keys and verify with staged smoke tests before reopening access.

## 8. Validation Commands

```bash
# RBAC environment and key validation
npm --workspace=apps/frontend run admin:rbac:validate

# Type safety
npm --workspace=apps/frontend run typecheck

# RBAC policy tests
npm --workspace=apps/frontend test -- admin-auth.test.ts

# Recruitment route regression checks
npm --workspace=apps/frontend test -- peer-recruitment-routes.test.ts
```

## 9. Scheduled Worker Wiring

Worker queue processing is wired for periodic execution:

- Vercel cron: `vercel.json` schedules `/api/peer-recruitment/workers/run?limit=25` every 10 minutes.
- Endpoint auth: set `PEER_RECRUITMENT_WORKER_API_KEY` and mirror the value to `CRON_SECRET` so Vercel sends a matching `Authorization: Bearer` token.
- Manual fallback: run `npm --workspace=apps/frontend run workers:run:once` in any scheduler (GitHub Actions, Cloud Scheduler, cron).

## 10. Ownership

- Primary owner: product engineering
- Security reviewer: trust and safety lead
- Operations approver: platform owner

## 11. Related Documents

- [README.md](../README.md)
- [peer-recruitment-execution-plan.md](./peer-recruitment-execution-plan.md)
- [peer-recruitment-feature-tracker.md](./peer-recruitment-feature-tracker.md)
