# Aether Architecture: Comprehensive Guide

## Overview

Aether is a **privacy-first student resilience platform** built on a production-ready monorepo architecture. It combines voice journaling (Echo), peer support matching (Peer Navigator), and guided resilience pathways in a layered, modular system.

This document explains the **Layered Architecture Diagram** and how components interact.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5: INFRASTRUCTURE & EXTERNAL SERVICES                   │
│  (Vercel, Docker, CDN, LLM APIs, Monitoring, Analytics)         │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 4: BACKEND SERVICES & API                                │
│  (Node.js Health Checks, API Gateway, Data Service, Jobs)       │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: DATA, STATE & LOCAL STORAGE                           │
│  (Browser Storage, RAG Config, Analytics Events, Content Store) │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: CORE FEATURES & AI SERVICES                           │
│  (Echo Engine, Peer Navigator, Resilience Pathway, Utilities)   │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: USER INTERFACE & PAGES                                │
│  (Home, About, Echo, Peer Navigator, Resilience, Blog, Ask, etc)│
└─────────────────────────────────────────────────────────────────┘
```

---

## LAYER 1: User Interface & Pages

### Purpose
Provides the **public-facing experience** where students interact with Aether's core features. Built with **Next.js 14 App Router**, TypeScript, and Tailwind CSS.

### Components

#### 🏠 **Home Page** (`/`)
- **Purpose**: Landing page, first impression, call-to-action
- **Key Features**:
  - Hero section with Aether's mission
  - Feature highlights (Echo, Peer Navigator, Resilience)
  - SEO-optimized metadata, Open Graph for social sharing
  - Dynamic sitemap & robots.txt for search engines
- **Tech**: Server Component layout, Metadata API, JSON-LD schema

#### ℹ️ **About Page** (`/about`)
- **Purpose**: Mission, vision, team, and impact story
- **Key Features**:
  - Founder story, team bios
  - Impact metrics (if available)
  - Call-to-action to sign up or learn more
- **Tech**: Markdown + React, static generation

#### 🎵 **Echo Page** (`/echo`)
- **Purpose**: Voice journaling with sentiment-aware guidance
- **Key Features**:
  - Audio capture (MediaRecorder API)
  - Optional in-browser transcription (with flag)
  - Emotion profiling via SentimentMapping
  - Journal preview and submission
- **Tech**: React Client Component, Audio APIs, emotion analysis hooks
- **States**:
  - `onRecordingComplete`: Raw transcription ready
  - `onCaptureComplete`: Sentiment + metadata captured

#### 👥 **Peer Navigator Page** (`/peer-navigator`)
- **Purpose**: Find, consent, and connect with peer support
- **Key Features**:
  - Eligibility screening questionnaire
  - Profile intake (goals, style, boundaries)
  - Match suggestions with explanations
  - Introduction workflow
  - Chat/messaging history
- **Tech**: Forms, RCSM matching engine integration, real-time state

#### 🌱 **Resilience Pathway Page** (`/resilience-pathway`)
- **Purpose**: Guided interventions and coping strategies
- **Key Features**:
  - Dynamic pathway selection based on journal entries
  - RAG-powered personalized guidance
  - 90-day resilience plan builder
  - Progress tracking
- **Tech**: RAG index queries, conversation state, progress persistence

#### 📝 **Blog Page** (`/blog`)
- **Purpose**: Educational articles and resources
- **Key Features**:
  - Markdown-backed articles (local or remote JSON)
  - Tags, search, pagination
  - Comments via Giscus (GitHub-backed)
  - RSS feed generation
- **Tech**: Markdown parsing, dynamic routes with `[slug]`

#### ❓ **Ask Page** (`/ask`)
- **Purpose**: Q&A triage and LLM-powered help
- **Key Features**:
  - Question submission form
  - Safety classification
  - LLM response generation (optional)
  - Crisis escalation
- **Tech**: Form validation, LLM API integration, content safety checks

#### 💬 **Feedback Page** (`/feedback`)
- **Purpose**: User surveys and bug reports
- **Key Features**:
  - Multi-step feedback form
  - Optional context (page, browser, timestamp)
  - Validation and submission
- **Tech**: Form state, analytics event tracking

#### 🔐 **Privacy & Accessibility Pages** (`/privacy`, `/accessibility`)
- **Purpose**: Legal compliance and inclusive design transparency
- **Key Features**:
  - Privacy policy (GDPR, FERPA, HIPAA-aware)
  - Accessibility statement (WCAG 2.1 AA)
  - Contact for compliance questions
- **Tech**: Static content, semantic HTML

#### 👑 **Admin Page** (`/admin`)
- **Purpose**: Internal dashboards for moderators and operators
- **Key Features**:
  - Fairness audit dashboard (matching distribution, bias detection)
  - User flagging and review queues
  - Content moderation
  - Reporting (outcomes, usage, safety incidents)
- **Tech**: Data visualization, access control, role-based views

---

## LAYER 2: Core Features & AI Services

### Purpose
Implements **business logic**, **intelligent systems**, and **feature-specific algorithms**. This is where Aether's unique value lives.

### Components

#### 🎵 **Echo: Voice Journaling Engine**

**Architecture**:
```
AudioCapture (MediaRecorder) 
  ↓ [optional in-browser STT]
Transcription (text)
  ↓ [derive emotion profile]
SentimentMapping (emotions, themes)
  ↓
JournalEntry (persisted locally/remote)
  ↓ [fedback to Resilience & Analytics]
```

**Key Modules**:
- **VoiceRecorder.tsx**: Capture loop, media stream handling, state callbacks
- **SentimentMapping.tsx**: Emotion profiling from text (via local or API)
- **Echo Callbacks**:
  - `onRecordingComplete(transcript)`: Raw transcription ready
  - `onCaptureComplete(entry)`: Full entry with sentiment metadata
- **Privacy**: Audio stored locally or server-side encrypted; never transmitted in plaintext

**Future Integrations**:
- Cloud storage for backup
- Long-term sentiment trends
- Multimodal analysis (text + transcription quality)

---

#### 👥 **Peer Navigator: RCSM Matching Engine**

**Layered Matching Pipeline**:

1. **Candidate Generation** (Recommender)
   - Input: Active, eligible users (opted-in, verified, not in cooldown)
   - Filter: Hard compatibility checks (role, language, timezone, goals)
   - Output: Top-K candidate edges per user, sparse graph for efficiency

2. **Reciprocal Scoring**
   - Compute bidirectional "fit" scores (not just one-way preference)
   - Factors: shared context, support style, boundaries, training match
   - Fairness constraints: capacity, cohort balance

3. **Constrained Global Optimization**
   - Problem: find stable, high-utility matching under fairness/safety gates
   - Safety gates: training verification, block lists, cooldown, consent
   - Fairness gates: equitable access, no bottleneck power users
   - Capacity gates: max active matches per user

4. **Stability Refinement** (Deferred Acceptance)
   - Improve match stability to reduce rematch churn
   - Prevent unstable pairings that break early
   - Output: Recommended matches with confidence scores

5. **Online Adaptation**
   - Contextual bandits: learn over time which match attributes predict success
   - Constrained exploration: test variants within safety boundaries
   - No cold-start: use aggregate cohort data

**Tech**:
- Core algorithm: `apps/frontend/src/lib/peer-matching/engine.ts`
- Matching cycle: every 1–5 minutes (configurable)
- Governance: `docs/peer-matching-algorithm.md`, `docs/peer-matching-service-contracts.md`

**Future Enhancements**:
- Backend job scheduler for matching cycles
- Database for persistent user profiles
- Explainability layer (why this match?)
- Multi-program support (different matching configs per campus/cohort)

---

#### 🌱 **Resilience Pathway: RAG-Enhanced Guidance**

**Architecture**:
```
UserJournal (Echo entries + metadata)
  ↓ [contextual relevance]
KnowledgeIndex (RAG embeddings)
  ↓ [top-K retrieval + ranking]
RetrievedContent (articles, coping strategies)
  ↓ [safety review + LLM augmentation]
PersonalizedGuidance (pathway + next steps)
  ↓ [user acceptance & interaction]
FeedbackLoop (outcome tracking)
```

**Key Components**:
- **RAG Configuration** (`apps/frontend/src/rag.config.json`):
  - Vector embeddings for articles, strategies, resources
  - Retrieval ranking criteria (recency, relevance, safety)
  - Cache management (TTL, invalidation)

- **Pathway Engine**:
  - Map journal sentiment + themes → recommended interventions
  - Provide 90-day guided plan with milestones
  - Check-ins and progress tracking

- **Knowledge Index**:
  - Articles on stress, resilience, peer support, mental health
  - Coping strategies (grounded in evidence, not medical advice)
  - Crisis resources (hotlines, local counseling)

**Safety & Boundaries**:
- Do not replace therapy; always frame as peer guidance
- Content review queue for sensitive topics
- Crisis escalation to professional resources (not LLM)
- Clear "when to seek help" messaging

**Tech**:
- Build: `apps/frontend/scripts/build-rag-index.mjs` (pre-deployment)
- Runtime: Retrieval library (similarity search)
- Future: Backend RAG service for real-time indexing

---

#### 🔧 **Shared Utilities & Hooks**

**Purpose**: Cross-cutting concerns and reusable logic.

**Key Modules**:

1. **Page Flag System** (`apps/frontend/src/lib/page-flags.ts`)
   - Feature flags for gradual rollout
   - `isPageEnabled(page)`: check if a page is live
   - `isPageEnabledForRequest(page, request)`: context-aware (A/B test, user cohort, etc.)
   - Example: rollout Echo to 10% of users first

2. **Analytics Provider** (`apps/frontend/src/components/AnalyticsProvider.tsx`)
   - Global event tracking
   - Pageview, user action, error instrumentation
   - Privacy-respecting (no PII unless consented)

3. **Blog Theme Switcher** (`apps/frontend/src/components/BlogThemeSwitcher.tsx`)
   - Dynamic light/dark mode for blog articles
   - Persists to LocalStorage
   - Tailwind CSS variable interpolation

4. **Type Definitions** (`apps/frontend/src/types/`)
   - Shared TypeScript interfaces (User, JournalEntry, Match, Pathway, etc.)
   - Ensures consistency across components and API contracts

5. **Fairness Audit Dashboard** (`apps/frontend/src/components/FairnessAuditDashboard.tsx`)
   - Visualization of matching outcomes (equity, diversity, retention)
   - Safety incident dashboard
   - Trend analysis and anomaly detection

---

## LAYER 3: Data, State & Local Storage

### Purpose
**Manages all data** at rest and in motion. Balances performance (client-side caching) with privacy (encryption, minimal server storage).

### Components

#### 📦 **Browser Storage**

**LocalStorage**:
- User preferences (theme, language, notification settings)
- Draft journal entries (so users don't lose work)
- Consent states (which features user opted into)
- Typical TTL: Indefinite (user-managed clearing)

**SessionStorage**:
- Ephemeral UI state (modal open/close, form step, scroll position)
- Auth tokens (cleared on session close)
- Typical TTL: Until browser tab close

**IndexedDB** (Async, larger quota):
- Large journals and match history
- RAG cache (embeddings, search results)
- Analytics event buffer (before batch upload)
- Typical TTL: 30–90 days (programmatic cleanup)

---

#### 🗂️ **RAG Configuration**

**Structure** (`rag.config.json`):
```json
{
  "knowledge": [
    {
      "id": "resilience-101",
      "title": "Resilience Basics",
      "content": "...",
      "category": "coping-strategies",
      "tags": ["stress", "anxiety"]
    }
  ],
  "retrieval": {
    "topK": 5,
    "threshold": 0.7,
    "safetyFilter": ["crisis", "self-harm"]
  }
}
```

**Build Process** (`scripts/build-rag-index.mjs`):
- Run at build time (or on CMS webhook)
- Compute embeddings for all knowledge
- Validate safety rules
- Generate optimized index for runtime retrieval

**Runtime Lookup**:
- User query / journal context → embed
- Similarity search in index
- Filter by safety, relevance, freshness
- Return top-K results

---

#### 📊 **Analytics Events**

**Captured Events**:
- **User Actions**: button clicks, form submissions, navigation
- **Feature Usage**: Echo record, match accept/reject, pathway progress, blog reads
- **Performance**: page load time, interaction latency
- **Errors**: exceptions, API failures, network timeouts

**Storage**:
- In-memory queue during session
- Periodically flush to analytics backend (Vercel Analytics, Sentry, etc.)
- IndexedDB backup if network unavailable

---

#### 👤 **User Profile**

**Data**:
- **Preferences**: language, theme, timezone, notification frequency
- **Consent States**: 
  - `consentToMatching`: yes/no (can opt-out anytime)
  - `consentToAnalytics`: yes/no
  - `consentToEmails`: yes/no
- **Onboarding**: which flows completed (signup, Echo intro, Peer Nav consent, etc.)
- **Feature Flags**: which experiments user is in

**Privacy**:
- Stored locally first (user in control)
- Synced to backend only if user explicitly logs in
- Encrypted in transit (HTTPS)

---

#### 📄 **Content & Blog Data**

**Source Options**:
1. **Local Markdown** (`content/blog/*.md`):
   - Author-owned, version-controlled
   - Built into static site
   - No external dependency

2. **Remote JSON** (optional CMS):
   - `BLOG_SOURCE=remote-json`
   - `BLOG_REMOTE_JSON_URL=https://cms.example.com/blog`
   - Allows CMS-based editing

**Build Process**:
- Pre-process markdown → HTML + metadata
- Extract headings, images, code blocks
- Generate TOC, RSS feed
- Deploy as static assets or dynamic routes

**Caching**:
- Static generation (SSG) for published content
- ISR (Incremental Static Regeneration) for blog drafts
- Browser cache (via `Cache-Control` headers)

---

## LAYER 4: Backend Services & API

### Purpose
**Provides server-side logic**, data persistence, and integration points. Currently minimal (health checks only), but designed to scale.

### Components

#### 💓 **Health Check Service**

**Endpoints**:
- `GET /health`: Full status response
  ```json
  {
    "status": "ok",
    "service": "backend",
    "timestamp": "2026-01-15T10:30:00Z"
  }
  ```
- `HEAD /health`: Lightweight probe (no body, same headers)

**Purpose**:
- Container orchestration liveness probe (Docker, Kubernetes)
- Uptime monitoring
- Load balancer health check

**Tech**: Node.js native `http` module, port 8080

---

#### 🌐 **API Gateway (Future)**

**Planned Endpoints**:
- `POST /api/echo/entries`: Save journal entry
- `GET /api/matches/suggestions`: Fetch peer match recommendations
- `POST /api/matches/accept`: Accept a match
- `GET /api/pathways/:id`: Get personalized resilience pathway
- `POST /api/feedback`: Submit user feedback

**Features**:
- REST API with JSON payloads
- Authentication (OAuth 2.0 / JWT)
- Rate limiting (per user, per endpoint)
- CORS for cross-origin requests
- Input validation + error handling

---

#### 💾 **Data Service (Future)**

**Responsibilities**:
- Persist journals, matches, user profiles to database
- Audit logging (who did what, when, why) for compliance
- ACID transactions for match state changes
- Encryption at rest (PII, health data)

**Tech Stack** (recommended):
- Database: PostgreSQL (ACID, JSONB for flexible schemas)
- ORM: Prisma or TypeORM
- Encryption: TweetNaCl (Ed25519, XSalsa20-Poly1305)

---

#### ⚡ **Async Jobs & Workers (Future)**

**Jobs**:
1. **Matching Cycles** (every 1–5 min):
   - Fetch eligible users
   - Run RCSM algorithm
   - Publish match suggestions
   - Track cycle metrics

2. **RAG Index Rebuild** (daily or on-demand):
   - Re-embed knowledge base
   - Update search index
   - Validate safety rules
   - Cache invalidation

3. **Email Campaigns** (async):
   - Match notifications
   - Reminder check-ins
   - Newsletter sends

4. **Analytics Batch** (hourly):
   - Aggregate events
   - Compute cohort metrics
   - Fairness audit queries
   - Alert on anomalies

**Tech**:
- Message Queue: BullMQ, AWS SQS, or RabbitMQ
- Worker: Node.js worker threads or separate containers
- Dead Letter Queue (DLQ) for failed jobs
- Retry logic with exponential backoff

---

## LAYER 5: Infrastructure & External Services

### Purpose
**Deployment, scaling, monitoring, and external integrations**. Ensures Aether runs reliably in production.

### Components

#### 📦 **Deployment**

**Frontend**:
- **Vercel** (primary):
  - Auto-deploy on Git push
  - Edge Functions for dynamic content
  - Built-in analytics, error tracking
  - Preview environments for PRs
  
- **Netlify** (alternative):
  - Static site hosting
  - Serverless functions
  - Form handling

**Backend**:
- **Docker**: Containerization
  - `Dockerfile` in repo root
  - Push to container registry (Docker Hub, ECR, GCR)
  - Deploy to: Kubernetes, Cloud Run, App Engine, etc.

**CI/CD**:
- GitHub Actions (native to repo)
- Triggers: push to main, PR, manual dispatch
- Jobs: lint, test, build, deploy

---

#### ⚡ **CDN & Performance**

**Next.js Image Optimization**:
- Auto-format to WebP where supported
- Responsive `srcset` generation
- Lazy loading and blur placeholder

**Global Edge Network**:
- Vercel Edge Functions (60+ regions)
- Low latency for geographically distributed users
- Edge-native data like IP, headers, geolocation

**Caching Strategy**:
- **Static pages** (SSG): long TTL (1 week+), cache everywhere
- **Dynamic pages** (ISR): revalidate on-demand or schedule
- **API responses**: short TTL (5–60 sec), with cache busting

**Performance Budget**:
- Monitor via `npm run perf:budget`
- Track Core Web Vitals (LCP, FID, CLS)
- Fail CI if budget exceeded

---

#### 🤖 **AI & LLM Services**

**Optional Integrations**:
- **OpenAI GPT** (Ask page, Resilience guidance generation)
- **Anthropic Claude** (Alternative LLM)
- **Google Speech-to-Text** (Echo transcription alternative)
- **Azure Content Moderator** (Safety & moderation)

**In-Browser Models** (Privacy-Preferred):
- `NEXT_PUBLIC_ECHO_ENABLE_BROWSER_MODELS=true`
- Whisper.cpp (speech-to-text, runs locally)
- Transformers.js (sentiment analysis, local embeddings)
- No data leaves device

**Cost Management**:
- Gradual rollout (% of users)
- Fallback to simpler models if API fails
- Token budgets per user, per day

---

#### 📈 **Monitoring & Observability**

**Analytics**:
- Vercel Analytics (built-in)
- Custom events to Mixpanel, Amplitude, or BigQuery
- Cohort analysis (match success by demographic)
- Feature adoption tracking

**Error Tracking**:
- Sentry (exceptions, stack traces, breadcrumbs)
- LogRocket (session replay, console logs)
- Custom error boundaries in React

**Performance**:
- Web Vitals tracking (LCP, FID, CLS)
- Real User Monitoring (RUM)
- API latency, database query performance
- Uptime monitoring (Pingdom, UptimeRobot)

---

#### 🔗 **Third-Party Integrations**

**Giscus** (`apps/frontend/src/components/GiscusComments.tsx`):
- GitHub-backed comment system
- Users can comment using GitHub login
- No separate database needed

**Social Sharing** (`apps/frontend/src/components/SocialShareLinks.tsx`):
- Twitter, LinkedIn, Facebook share buttons
- Generates share preview with Open Graph tags
- Analytics tracking on shares

**SEO & Metadata**:
- `robots.txt`: control crawler access
- `sitemap.xml`: list all public pages
- JSON-LD: structured data for Google, Bing, etc.
- Open Graph tags: rich previews on social media

---

## Data Flow: End-to-End Examples

### Example 1: Echo Journal Entry

```
1. User opens /echo page
   ↓
2. Clicks "Start Recording"
   → MediaRecorder starts, UI shows active state
   ↓
3. Speaks thoughts (e.g., "I've been feeling anxious about exams")
   ↓
4. Clicks "Stop Recording"
   → Audio sent to transcription (browser or API)
   → onRecordingComplete(transcript) fired
   → Preview shown to user for confirmation
   ↓
5. User clicks "Save"
   → SentimentMapping analyzes emotion (anxiety: 0.8)
   → onCaptureComplete(journalEntry) fired
   → Entry saved to LocalStorage + IndexedDB
   → Analytics event: "echo.entry.saved"
   ↓
6. Resilience Pathway component listens to journal updates
   → Queries RAG index for anxiety-related resources
   → Suggests relevant pathway
   ↓
7. User views suggested pathway
   → Accepts/rejects suggestions
   → Progress saved
```

### Example 2: Peer Matching Cycle

```
1. Matching cycle job runs (every 5 min)
   ↓
2. Fetch all eligible users from database
   - Filter: opted-in, verified training, not in cooldown, no blocks
   ↓
3. For each user, generate candidate edges
   - Query: goals, support style, language, timezone, shared context
   - Filter: hard compatibility rules
   - Compute reciprocal scores
   ↓
4. Apply constrained optimization
   - Enforce safety gates (verification, block lists)
   - Enforce fairness gates (equitable access)
   - Enforce capacity gates (max matches per user)
   ↓
5. Refine via deferred acceptance
   - Improve stability of matching
   ↓
6. Publish match suggestions
   - Save to database
   - Send push notification to users
   - Notify admins of any anomalies
   ↓
7. User opens /peer-navigator
   - Views match suggestion + confidence score
   - Can ask "Why this person?" (explainability)
   - Accepts/rejects match
   ↓
8. If accepted:
   - Both users notified
   - Warm introduction email sent
   - First-message template provided
   - Conversation thread created
```

### Example 3: Resilience Pathway Personalization

```
1. User completes multiple Echo entries over a week
   ↓
2. Resilience Pathway page loaded
   ↓
3. Page aggregates recent journal entries
   - Extract themes: [anxiety, sleep, social]
   - Compute aggregate sentiment: moderate stress
   ↓
4. Query RAG index
   - Search: "anxiety, sleep, social support"
   - Retrieve: top 5 most relevant articles + strategies
   ↓
5. Rank by relevance + safety
   - Filter out crisis content (redirect to hotline)
   - Rank by user's past engagement
   ↓
6. Combine with Peer Navigator data
   - If user has active match: suggest conversation starter
   ↓
7. Generate 90-day plan
   - Week 1: "Sleep hygiene basics"
   - Week 2: "Anxiety grounding techniques"
   - Week 3: "Peer conversation skills"
   ↓
8. User follows plan, provides feedback
   - RAG system learns preferences
   - Adjust future recommendations
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind | UI, App Router, SSR/SSG, styling |
| **Testing** | Jest, React Testing Library | Unit & integration tests |
| **Code Quality** | ESLint, Prettier, TypeScript | Linting, formatting, type safety |
| **Build** | Webpack (Next.js built-in) | Bundling, code splitting, optimization |
| **Deployment** | Vercel, Docker | Static hosting, container orchestration |
| **Backend** | Node.js 22.19.0, Express (future) | Server, API, jobs |
| **Database** | PostgreSQL (planned) | Persistent storage, ACID |
| **Cache** | Redis (planned), IndexedDB | Performance, offline support |
| **Analytics** | Vercel Analytics, Sentry | Monitoring, error tracking |
| **AI/LLM** | OpenAI (optional), Whisper.cpp (local) | Language models, speech-to-text |
| **RAG** | Custom vector embeddings, similarity search | Resilience guidance retrieval |

---

## Security & Privacy Principles

1. **Consent-First**: Always ask before collecting/using data
2. **Privacy by Design**: Minimize data, process locally where possible
3. **Encryption**: HTTPS in transit, encryption at rest for sensitive data
4. **Access Control**: Role-based permissions (admin, moderator, user)
5. **Audit Logging**: Track all data access for compliance
6. **Data Retention**: Clear deletion policies (GDPR right-to-be-forgotten)
7. **Safety Gating**: Content review, crisis escalation, fairness checks

---

## Scaling & Future Roadmap

### Near-term (3–6 months)
- Implement API Gateway layer (REST endpoints)
- Deploy database (PostgreSQL with encryption)
- Backend job scheduler for matching cycles
- RAG index rebuild automation

### Medium-term (6–12 months)
- Peer Navigator MVP with real matching
- Scale to 100+ concurrent users
- Multi-program support (different campuses)
- Analytics dashboards for program operators

### Long-term (12+ months)
- Federated learning for local model training
- Microservices architecture (separate Echo, Matching, Guidance services)
- Mobile apps (React Native)
- Integration with institutional systems (SSO, CRM, LMS)

---

## Deployment Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm run test:ci`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Performance budget met: `npm run perf:budget`
- [ ] Security headers configured (CSP, X-Frame-Options)
- [ ] Analytics event tracking verified
- [ ] Error tracking (Sentry) configured
- [ ] Database migrations run (if applicable)
- [ ] Backup strategy documented
- [ ] Incident response plan in place

---

## Key Contacts & Resources

- **Documentation**: `docs/`
- **Architecture Diagram**: `docs/aether-architecture-layered.svg`
- **Peer Matching Spec**: `docs/peer-matching-algorithm.md`
- **Peer Navigator Plan**: `docs/peer-navigator-network-implementation-plan.md`
- **Code**: `apps/frontend/` (Next.js), `apps/backend/` (Node.js)
- **Tests**: `apps/*/src/**/*.test.ts`

---

**Last Updated**: January 2026  
**Maintainer**: Aarti Sri Ravikumar  
**License**: MIT
