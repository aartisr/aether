# Aether Architecture: Quick Reference Guide

**TL;DR**: Aether is a **6-layer monorepo** with privacy-first journaling (Echo), peer matching (RCSM), and guided resilience pathways (RAG-powered).

---

## Quick Navigation

| Want to... | Go to... | File |
|-----------|----------|------|
| **Understand overall architecture** | Full diagram | `docs/aether-architecture-layered.svg` |
| **Read detailed explanations** | Architecture guide | `docs/ARCHITECTURE.md` |
| **Add a new page** | Layer 1 | `apps/frontend/src/app/[route]/page.tsx` |
| **Add a feature component** | Layer 2 | `apps/frontend/src/components/` |
| **Modify Echo** | Layer 2 (Echo) | `apps/frontend/src/components/echo/` |
| **Modify Peer Matching** | Layer 2 (RCSM) | `apps/frontend/src/lib/peer-matching/engine.ts` |
| **Modify RAG** | Layer 3 + 2 | `apps/frontend/rag.config.json` + `apps/frontend/src/lib/` |
| **Add state/storage** | Layer 3 | `apps/frontend/src/lib/` (hooks, storage) |
| **Add backend endpoint** | Layer 4 | `apps/backend/index.js` |
| **Configure deployment** | Layer 5 | `vercel.json`, `netlify.toml`, `Dockerfile` |
| **Run Admin CMS interactive QA** | QA checklist | `docs/admin-cms-interactive-qa-checklist.md` |

---

## Layer Cheat Sheet

```
┌─────────────────────────────────────────────────────┐
│ LAYER 5: Infrastructure (Vercel, Docker, CDN)      │
├─────────────────────────────────────────────────────┤
│ LAYER 4: Backend (Node.js, API Gateway, Jobs)      │
├─────────────────────────────────────────────────────┤
│ LAYER 3: Data (LocalStorage, RAG, Analytics)       │
├─────────────────────────────────────────────────────┤
│ LAYER 2: Features (Echo, Peer Nav, Resilience)     │
├─────────────────────────────────────────────────────┤
│ LAYER 1: Pages (UI, routes, components)            │
└─────────────────────────────────────────────────────┘
```

---

## Core Features at a Glance

### 🎵 Echo (Journaling)

**Path**: `apps/frontend/src/components/echo/`

**Flow**:
1. Audio capture (MediaRecorder)
2. Transcription (browser or API)
3. Sentiment analysis (SentimentMapping)
4. Save to LocalStorage

**Key Files**:
- `VoiceRecorder.tsx`: Audio capture UI
- `SentimentMapping.tsx`: Emotion profiling
- `apps/frontend/src/app/echo/page.tsx`: Page route

**Hooks**:
```typescript
// Use refs to avoid state staleness in audio callbacks
const transcriptRef = useRef('');
const onRecordingComplete = (transcript) => {
  transcriptRef.current = transcript; // ← always read from ref in onstop
};
```

---

### 👥 Peer Navigator (Matching)

**Path**: `apps/frontend/src/lib/peer-matching/engine.ts`

**Algorithm**: Reciprocal Constrained Stable Matching (RCSM)
- Candidate generation (top-K recommender)
- Constrained optimization (fairness, safety, capacity)
- Stability refinement (deferred acceptance)
- Online adaptation (contextual bandits)

**Flow**:
1. User creates/updates profile (goals, style, boundaries)
2. Matching cycle runs (every 1–5 min) [backend job]
3. User sees match suggestions with explanations
4. User accepts/rejects
5. Warm introduction sent if both accept

**Key Files**:
- `docs/peer-matching-algorithm.md`: Full spec
- `docs/peer-matching-service-contracts.md`: API contracts
- `apps/frontend/src/app/peer-navigator/page.tsx`: Page route

---

### 🌱 Resilience Pathway (Guided Support)

**Path**: `apps/frontend/rag.config.json` + `apps/frontend/src/lib/`

**Architecture**: Retrieval-Augmented Generation (RAG)
- Knowledge index (embeddings + content)
- User query (from Echo entries or explicit question)
- Retrieval (top-K similar items)
- Ranking + safety filtering
- Return personalized guidance

**Flow**:
1. User completes Echo entries over time
2. Pathway page aggregates journal themes/sentiment
3. Queries RAG index for relevant resources
4. Displays curated 90-day plan
5. User follows pathways, gets check-ins

**Key Files**:
- `apps/frontend/rag.config.json`: Knowledge config
- `apps/frontend/scripts/build-rag-index.mjs`: Build script
- `apps/frontend/src/app/resilience-pathway/page.tsx`: Page route

---

## Component Map

```
src/
├── app/
│   ├── page.tsx                    ← Home
│   ├── about/page.tsx              ← About
│   ├── echo/page.tsx               ← Echo
│   ├── peer-navigator/page.tsx     ← Peer Navigator
│   ├── resilience-pathway/page.tsx ← Resilience
│   ├── blog/[slug]/page.tsx        ← Blog
│   ├── ask/page.tsx                ← Ask Q&A
│   ├── feedback/page.tsx           ← Feedback
│   ├── admin/page.tsx              ← Admin Dashboard
│   ├── privacy/page.tsx            ← Privacy Policy
│   ├── accessibility/page.tsx      ← Accessibility
│   └── layout.tsx                  ← Root layout
├── components/
│   ├── echo/
│   │   ├── VoiceRecorder.tsx
│   │   ├── SentimentMapping.tsx
│   │   └── JournalPreview.tsx
│   ├── peer/
│   │   ├── MatchSuggestion.tsx
│   │   ├── ProfileForm.tsx
│   │   └── ConversationThread.tsx
│   ├── resilience/
│   │   ├── PathwayBuilder.tsx
│   │   ├── KnowledgeGrid.tsx
│   │   └── ProgressTracker.tsx
│   ├── layout/
│   │   ├── SiteHeader.tsx
│   │   ├── SiteFooter.tsx
│   │   └── SiteReturnLoop.tsx
│   ├── assistant/
│   │   └── FloatingAssistantLoader.tsx
│   ├── brand/
│   │   └── LogoSvg.tsx
│   ├── AnalyticsProvider.tsx
│   ├── BlogThemeSwitcher.tsx
│   ├── FairnessAuditDashboard.tsx
│   └── GiscusComments.tsx
├── lib/
│   ├── peer-matching/
│   │   ├── engine.ts               ← RCSM algorithm
│   │   ├── scoring.ts
│   │   └── validation.ts
│   ├── page-flags.ts
│   ├── analytics.ts
│   └── rag-retrieval.ts            ← RAG query engine
├── pages/                          ← Legacy routes (if any)
└── types/
    ├── index.ts
    ├── journal.ts
    ├── match.ts
    └── user.ts
```

---

## Environment Variables

**Frontend** (`.env.local`):
```bash
# SEO & Site Config
NEXT_PUBLIC_SITE_URL=https://aether.example.com

# Echo Options
NEXT_PUBLIC_ECHO_ENABLE_BROWSER_MODELS=true    # Use Whisper.cpp locally

# Blog Source
BLOG_SOURCE=local-markdown                      # or 'remote-json'
BLOG_CONTENT_DIR=content/blog                   # Custom dir (optional)
BLOG_REMOTE_JSON_URL=https://cms.example.com   # If remote-json

# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Analytics
NEXT_PUBLIC_ANALYTICS_KEY=***
SENTRY_AUTH_TOKEN=***

# LLM Services (Optional)
OPENAI_API_KEY=***
ANTHROPIC_API_KEY=***
```

**Backend** (`.env.local`):
```bash
PORT=8080
NODE_ENV=development
LOG_LEVEL=debug
```

---

## Common Tasks

### RBAC Quick Verify (2 Minutes)

Use this checklist after deploy or key rotation.

1. Confirm env variables are present:
  - `AETHER_ENABLE_ADMIN_PAGE=true`
  - `AETHER_ADMIN_SESSION_SECRET`
  - `AETHER_ADMIN_OWNER_KEYS`
  - `AETHER_ADMIN_OPERATOR_KEYS`
  - `AETHER_ADMIN_REVIEWER_KEYS`
2. Sign in with a reviewer key:
  - Allowed: `/admin/peers/audit`, `/admin/feedback`
  - Denied: `/admin/peers`, `/admin/cms`, `/admin/page-controls`
3. Sign in with an operator key:
  - Allowed: `/admin/peers`, `/admin/peers/audit`, `/admin/feedback`
  - Denied: `/admin/cms`, `/admin/page-controls`
4. Sign in with an owner key:
  - Allowed: all admin routes including `/admin/cms` and `/admin/page-controls`
5. Verify sign-out clears admin session and blocks admin pages until next login.
6. Validate deployment keys and role config:
  - `npm --workspace=apps/frontend run admin:rbac:validate`

Reference runbook: `docs/admin-rbac-rollout-runbook.md`.

### Worker Scheduler Quick Verify (2 Minutes)

1. Confirm cron wiring exists in `vercel.json` for `/api/peer-recruitment/workers/run`.
2. Confirm env variables are set:
  - `PEER_RECRUITMENT_WORKER_API_KEY`
  - `CRON_SECRET` (same value as worker API key)
3. Manually run one cycle:
  - `npm --workspace=apps/frontend run workers:run:once`
4. Confirm queue updates:
  - `GET /api/peer-recruitment/workers/jobs?status=completed`

### Add a New Page

```bash
# 1. Create directory
mkdir -p apps/frontend/src/app/my-feature

# 2. Create page
cat > apps/frontend/src/app/my-feature/page.tsx << 'EOF'
export default function MyFeaturePage() {
  return <main><h1>My Feature</h1></main>;
}
EOF

# 3. Add metadata (optional)
echo 'export const metadata = { title: "My Feature" };' >> $_

# 4. Test
npm run dev
# Visit http://localhost:3000/my-feature
```

### Add a New Component

```bash
# 1. Create file
cat > apps/frontend/src/components/MyComponent.tsx << 'EOF'
export default function MyComponent({ children }) {
  return <div className="my-component">{children}</div>;
}
EOF

# 2. Add tests
cat > apps/frontend/src/components/MyComponent.test.tsx << 'EOF'
import { render } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders', () => {
  const { getByText } = render(<MyComponent>Hello</MyComponent>);
  expect(getByText('Hello')).toBeInTheDocument();
});
EOF

# 3. Test
npm run test
```

### Modify Peer Matching Algorithm

```bash
# Edit the engine
vim apps/frontend/src/lib/peer-matching/engine.ts

# Check algorithm spec
cat docs/peer-matching-algorithm.md

# Test matching logic
npm run test -- peer-matching
```

### Add to RAG Index

```bash
# 1. Add knowledge to config
cat >> apps/frontend/rag.config.json << 'EOF'
{
  "id": "my-article-123",
  "title": "Stress Management",
  "content": "...",
  "category": "coping-strategies",
  "tags": ["stress", "mindfulness"]
}
EOF

# 2. Rebuild index (at build time)
npm run build

# 3. Test retrieval at runtime
# RAG queries happen in Resilience Pathway component
```

### Deploy to Vercel

```bash
# Push to main branch
git add .
git commit -m "Feature: add my-feature"
git push origin main

# Vercel auto-deploys via GitHub webhook
# Check: https://vercel.com/dashboard
```

### Monitor Production

```bash
# Check health endpoint
curl https://aether.example.com/api/health

# View analytics (Vercel)
# https://vercel.com/[project]/analytics

# Check errors (Sentry)
# https://sentry.io/organizations/[org]/

# View frontend logs (browser DevTools)
# Open Console, look for analytics events
```

---

## Testing Strategy

| Layer | Test Type | Command | Files |
|-------|-----------|---------|-------|
| Components | Unit + Integration | `npm run test` | `src/**/*.test.tsx` |
| Pages | E2E (future) | `npm run test:e2e` | `e2e/**/*.test.ts` |
| Backend | Unit | `npm --workspace=apps/backend run test` | `apps/backend/**/*.test.js` |
| Build | Smoke | `npm run build` | Built output validation |
| Type | Type checking | `npm run typecheck` | TypeScript errors |
| Lint | Style | `npm run lint` | ESLint + Prettier |
| Perf | Performance | `npm run perf:budget` | Core Web Vitals |

**Run all checks**:
```bash
npm run check  # Runs lint + typecheck + test
```

---

## Performance Checklist

- [ ] Images optimized (Next.js Image component)
- [ ] Code-split components (React.lazy)
- [ ] Avoid above-the-fold `initial={{ opacity: 0 }}` (Framer Motion)
- [ ] Cache-Control headers set (static: 1y, dynamic: revalidate)
- [ ] Bundle analyzed (`npm run analyze`)
- [ ] Lighthouse score 90+ (run locally)
- [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] Performance budget within limits

---

## Security Checklist

- [ ] No secrets in `.env.example` or code
- [ ] CORS configured correctly (backend)
- [ ] CSP headers set
- [ ] HTTPS enforced (all routes)
- [ ] OWASP Top 10 reviewed
- [ ] Dependency vulnerabilities checked: `npm audit`
- [ ] User input validated + sanitized
- [ ] Authentication/authorization in place
- [ ] Sensitive data encrypted in storage/transit
- [ ] Privacy policy up-to-date

---

## Debugging Tips

### Echo Not Recording

```typescript
// Check:
// 1. MediaRecorder.isTypeSupported(mimeType)
// 2. getUserMedia permissions granted
// 3. onRecordingComplete is bound correctly

console.log('RecorderState:', { isRecording, transcript });
```

### Peer Matching Not Showing Suggestions

```typescript
// Check:
// 1. User profile complete
// 2. Opt-in consent given
// 3. Matching cycle has run
// 4. No blocks or cooldown active

const matches = queryRCSMEngine(userId);
console.log('MatchCount:', matches.length);
```

### RAG Not Retrieving Content

```typescript
// Check:
// 1. rag.config.json valid JSON
// 2. build-rag-index.mjs ran successfully
// 3. Knowledge items have proper embeddings
// 4. Query includes relevant keywords

const results = retrieveRAG(query);
console.log('RetrievalResults:', results);
```

### Performance Slow

```bash
# Analyze bundle size
npm run analyze

# Check Core Web Vitals
lighthouse https://aether.example.com --view

# Profile in DevTools
# Performance tab → Record → Interact → Stop
```

---

## Glossary

| Term | Definition |
|------|-----------|
| **Echo** | Voice journaling feature with sentiment analysis |
| **Peer Navigator** | Peer matching network using RCSM algorithm |
| **RCSM** | Reciprocal Constrained Stable Matching (algorithm) |
| **RAG** | Retrieval-Augmented Generation (knowledge retrieval) |
| **Resilience Pathway** | Guided interventions based on journal themes |
| **Page Flags** | Feature flags for gradual rollout |
| **SentimentMapping** | Emotion profiling from text |
| **ISR** | Incremental Static Regeneration (Next.js caching) |
| **SSR/SSG** | Server-Side Rendering / Static Site Generation |
| **CMS** | Content Management System (blog source) |

---

## Key Files to Know

```
aether/
├── README.md                           ← Project overview
├── package.json                        ← Workspace + scripts
├── Dockerfile                          ← Backend containerization
├── jest.config.js                      ← Jest config
├── tsconfig.json                       ← TypeScript config
├── vercel.json                         ← Vercel deployment
├── netlify.toml                        ← Netlify deployment
├── docs/
│   ├── aether-architecture-layered.svg ← This diagram
│   ├── ARCHITECTURE.md                 ← Detailed guide
│   ├── peer-matching-algorithm.md      ← RCSM spec
│   └── peer-navigator-network-implementation-plan.md
├── apps/
│   ├── frontend/                       ← Next.js app
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── rag.config.json             ← RAG knowledge
│   │   ├── tailwind.config.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── scripts/
│   │       ├── build-rag-index.mjs     ← Build RAG
│   │       └── perf-smoke.mjs          ← Perf testing
│   └── backend/                        ← Node.js backend
│       ├── package.json
│       ├── index.js                    ← Health endpoint
│       └── server.js
├── content/
│   └── blog/                           ← Blog articles
└── packages/
    ├── shared-ui/                      ← Shared components (future)
    └── site-config/                    ← Shared config (future)
```

---

## Getting Help

1. **Read the docs**: `docs/ARCHITECTURE.md` (this file)
2. **Check code**: Search in `src/` for similar patterns
3. **Run tests**: `npm run test -- --verbose`
4. **Debug**: Use browser DevTools + `console.log`
5. **Ask team**: Mention `@aartisr` or create GitHub issue

---

**Last Updated**: January 2026  
**For Questions**: See `CONTRIBUTING.md`
