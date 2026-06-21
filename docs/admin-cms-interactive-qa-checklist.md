# Admin CMS Interactive QA Checklist

Purpose: verify that interactive pages in Admin CMS are fully editable, publish correctly, and fall back correctly when override content is cleared.

## Preconditions

- Frontend dev server is running.
- Admin access is configured.
- Tester can sign in at `/admin/login`.

## Smoke Flow (2-5 minutes)

1. Open `/admin/cms`.
2. Confirm page loads with the editor shell and block canvas.
3. For each route below, open the route-specific admin URL and run the checks.

## Route Checks

### 1) Ask Aether (`/admin/cms?page=ask`)

- Confirm header shows `Editing: Ask Aether`.
- Click `AskAssistantBlock` in canvas.
- Edit `Title` and `Description`.
- Add one `starterPrompts` entry.
- Confirm canvas preview updates immediately.

### 2) Echo Chamber (`/admin/cms?page=echo`)

- Confirm header shows `Editing: Echo Chamber`.
- Click `EchoStudioBlock`.
- Edit `Title` and `Description`.
- Confirm embedded voice/sentiment UI still renders.

### 3) Feedback (`/admin/cms?page=feedback`)

- Confirm header shows `Editing: Feedback`.
- Click `FeedbackFormBlock`.
- Edit `Title`, `Description`, and `productName`.
- Confirm embedded form remains visible.

### 4) Fairness & Governance (`/admin/cms?page=fairness-governance`)

- Confirm header shows `Editing: Fairness & Governance`.
- Click `FairnessDashboardBlock`.
- Edit `Title` and `Description`.
- Confirm dashboard embed remains visible.

### 5) Resilience Pathway (`/admin/cms?page=resilience-pathway`)

- Confirm header shows `Editing: Resilience Pathway`.
- Click `ResilienceToolkitBlock`.
- Edit `Title` and `Description`.
- Confirm toolkit modules remain visible.

## Publish and Fallback Verification

1. On any route above, click `Publish`.
2. Confirm success status message appears in Admin CMS.
3. Open the public route and confirm edited copy appears.
4. Return to Admin CMS and click `Clear Published Override`.
5. Refresh the public route and confirm fallback content is restored.

## Pass Criteria

- Interactive block exists on each target page.
- Block properties are editable from right panel.
- Preview updates as edits are made.
- Publish persists route override content.
- Clear override restores fallback behavior.

## Failure Triage Notes

- If route redirects to login unexpectedly: verify admin session cookie and auth config.
- If interactive block is missing: verify default scaffold for page in CMS config.
- If publish succeeds but route does not update: verify API response and CMS storage write/read path.
- If override clear fails: verify delete path in CMS storage and route resolution.
