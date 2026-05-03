export type AssistantRole = 'user' | 'assistant';

export type AssistantSource = {
  title: string;
  href: string;
  description: string;
};

export type AssistantAction = {
  label: string;
  href: string;
  description: string;
  priority: 'primary' | 'secondary';
};

export type AssistantMessageInput = {
  role: AssistantRole;
  content: string;
};

export type AssistantReply = {
  answer: string;
  sources: AssistantSource[];
  actions: AssistantAction[];
  suggestions: string[];
  confidence: 'high' | 'medium' | 'low';
  contextLabel: string;
};

export type AssistantRequest = {
  message: string;
  contextPath?: string;
  history?: AssistantMessageInput[];
};

type AssistantTopic = {
  id: string;
  label: string;
  keywords: string[];
  sources: AssistantSource[];
  actions: AssistantAction[];
  suggestions: string[];
  answer: (context: AssistantContextProfile) => string;
};

export type AssistantContextProfile = {
  label: string;
  path: string;
  summary: string;
  suggestions: string[];
  actions: AssistantAction[];
  source: AssistantSource;
};

const githubBaseUrl = 'https://github.com/aartisr/aether/blob/main';

const sourceLibrary = {
  home: {
    title: 'Aether Home',
    href: '/',
    description: 'Overview of the Aether student resilience ecosystem and core pathways.',
  },
  about: {
    title: 'About Aether',
    href: '/about',
    description: 'Mission, architecture, and positioning for the Aether platform.',
  },
  mentors: {
    title: 'Mentors',
    href: '/mentors',
    description: 'Recognition of the mentors who shaped Aether strategy, ethics, and implementation.',
  },
  peerNavigator: {
    title: 'Peer Navigator',
    href: '/peer-navigator',
    description: 'Peer matching experience and privacy-aware student support flow.',
  },
  peerNetworkPlan: {
    title: 'Peer-Navigator Network Implementation Plan',
    href: `${githubBaseUrl}/docs/peer-navigator-network-implementation-plan.md`,
    description: 'Detailed plan for data collection, safety gates, matching, engagement, and governance.',
  },
  peerAlgorithm: {
    title: 'Peer Matching Algorithm',
    href: `${githubBaseUrl}/docs/peer-matching-algorithm.md`,
    description: 'Reciprocal constrained stable matching design with fairness and outcome learning.',
  },
  ragPlan: {
    title: 'Lightweight Conversational RAG Strategy',
    href: `${githubBaseUrl}/docs/lightweight-conversational-rag-strategy.md`,
    description: 'Static, Vercel-friendly RAG strategy using build-time indexing and local retrieval.',
  },
  privacy: {
    title: 'Privacy',
    href: '/privacy',
    description: 'Privacy-by-design approach, minimized data exposure, and safety boundaries.',
  },
  resilience: {
    title: 'Resilience Pathway',
    href: '/resilience-pathway',
    description: 'Guided student resilience pathway with check-ins, support routing, and habits.',
  },
  echo: {
    title: 'Echo Chamber',
    href: '/echo',
    description: 'Private reflection experience with on-device transcript and sentiment mapping.',
  },
  fairness: {
    title: 'Fairness Governance',
    href: '/fairness-governance',
    description: 'Governance dashboard for fairness metrics, audit trails, and policy status.',
  },
  blog: {
    title: 'Aether Journal',
    href: '/blog',
    description: 'Evidence-informed writing and product notes for student resilience.',
  },
  admin: {
    title: 'Admin Page Controls',
    href: '/admin/page-controls',
    description: 'Runtime controls for enabling and disabling public pages.',
  },
  crisis: {
    title: '988 Lifeline',
    href: 'https://988lifeline.org/',
    description: 'United States crisis support for immediate mental health emergencies.',
  },
} satisfies Record<string, AssistantSource>;

const actionLibrary = {
  home: {
    label: 'Go home',
    href: '/',
    description: 'Return to the main Aether overview.',
    priority: 'secondary',
  },
  about: {
    label: 'Open About',
    href: '/about',
    description: 'Understand Aether mission, positioning, and product architecture.',
    priority: 'primary',
  },
  mentors: {
    label: 'View Mentors',
    href: '/mentors',
    description: 'See the people and guidance behind the project.',
    priority: 'secondary',
  },
  ask: {
    label: 'Open full copilot',
    href: '/ask',
    description: 'Use the larger workspace for deeper questions across Aether.',
    priority: 'primary',
  },
  peerPlan: {
    label: 'Review Peer-Navigator plan',
    href: sourceLibrary.peerNetworkPlan.href,
    description: 'Open the detailed implementation plan in the repository.',
    priority: 'primary',
  },
  matchingAlgorithm: {
    label: 'Open matching algorithm',
    href: sourceLibrary.peerAlgorithm.href,
    description: 'Read the reciprocal matching design and fairness model.',
    priority: 'secondary',
  },
  ragPlan: {
    label: 'Read AI approach',
    href: sourceLibrary.ragPlan.href,
    description: 'See how Aether keeps assistant answers grounded in approved content.',
    priority: 'primary',
  },
  privacy: {
    label: 'Open Privacy',
    href: '/privacy',
    description: 'Review privacy, data minimization, and trust boundaries.',
    priority: 'secondary',
  },
  crisis: {
    label: 'Call or text 988',
    href: sourceLibrary.crisis.href,
    description: 'Open the 988 Lifeline for urgent United States crisis support.',
    priority: 'primary',
  },
} satisfies Record<string, AssistantAction>;

const contextProfiles: AssistantContextProfile[] = [
  {
    label: 'Home',
    path: '/',
    summary: 'You are on the overview page. Good questions here are about what Aether is, where to start, and which pathway fits a visitor.',
    suggestions: ['What should I explore first?', 'Explain Aether in one minute', 'What pages are available right now?'],
    actions: [actionLibrary.about, actionLibrary.mentors, actionLibrary.ask],
    source: sourceLibrary.home,
  },
  {
    label: 'About',
    path: '/about',
    summary: 'You are on the About page. This is best for mission, positioning, and how Aether frames student resilience.',
    suggestions: ['What is Aether trying to solve?', 'How is Aether different?', 'Summarize the product architecture'],
    actions: [actionLibrary.mentors, actionLibrary.ask],
    source: sourceLibrary.about,
  },
  {
    label: 'Mentors',
    path: '/mentors',
    summary: 'You are on the Mentors page. This context is about people, guidance, ethics, and project influence.',
    suggestions: ['How did mentors shape Aether?', 'Why is mentorship part of the product story?', 'Summarize the mentor recognition page'],
    actions: [actionLibrary.about, actionLibrary.ask],
    source: sourceLibrary.mentors,
  },
  {
    label: 'Peer Navigator',
    path: '/peer-navigator',
    summary: 'You are on the Peer Navigator experience. This context is about matching, peer support, privacy, and safety gates.',
    suggestions: ['How does peer matching work?', 'What data should Peer Navigator collect?', 'What safety gates are needed?'],
    actions: [actionLibrary.peerPlan, actionLibrary.matchingAlgorithm],
    source: sourceLibrary.peerNavigator,
  },
  {
    label: 'Fairness Governance',
    path: '/fairness-governance',
    summary: 'You are on the fairness dashboard. This context is about auditability, parity, quality floors, and policy review.',
    suggestions: ['Explain the fairness dashboard', 'What does exposure parity mean?', 'How should we audit matching?'],
    actions: [actionLibrary.matchingAlgorithm, actionLibrary.peerPlan],
    source: sourceLibrary.fairness,
  },
  {
    label: 'Privacy',
    path: '/privacy',
    summary: 'You are on the Privacy page. This context is about local-first design, minimized data, and trust boundaries.',
    suggestions: ['Explain Aether privacy simply', 'What information stays protected?', 'How does Aether keep answers trustworthy?'],
    actions: [actionLibrary.ask, actionLibrary.about],
    source: sourceLibrary.privacy,
  },
  {
    label: 'Resilience Pathway',
    path: '/resilience-pathway',
    summary: 'You are on the resilience pathway. This context is about check-ins, care navigation, support mapping, and habits.',
    suggestions: ['What should a student do first?', 'Explain the resilience pathway', 'How does care navigation work?'],
    actions: [actionLibrary.ask, actionLibrary.about],
    source: sourceLibrary.resilience,
  },
  {
    label: 'Echo',
    path: '/echo',
    summary: 'You are on Echo Chamber. This context is about private reflection, transcript capture, sentiment mapping, and safety signals.',
    suggestions: ['What is Echo for?', 'How does local sentiment mapping work?', 'What are the privacy boundaries?'],
    actions: [actionLibrary.privacy, actionLibrary.ask],
    source: sourceLibrary.echo,
  },
  {
    label: 'Aether Journal',
    path: '/blog',
    summary: 'You are in the journal. This context is about evidence-informed articles, product notes, and practical student guidance.',
    suggestions: ['What should I read first?', 'Summarize the journal purpose', 'How should articles be cited?'],
    actions: [actionLibrary.ask, actionLibrary.about],
    source: sourceLibrary.blog,
  },
  {
    label: 'Ask Aether',
    path: '/ask',
    summary: 'You are in the full assistant workspace. This context is best for broad questions across Aether content.',
    suggestions: ['Where should I start?', 'What pages can I use right now?', 'Help me find the right support path'],
    actions: [actionLibrary.about, actionLibrary.mentors, actionLibrary.privacy],
    source: sourceLibrary.home,
  },
];

const topics: AssistantTopic[] = [
  {
    id: 'crisis',
    label: 'Safety support',
    keywords: ['suicide', 'kill myself', 'self harm', 'hurt myself', 'immediate danger', 'emergency', 'crisis'],
    sources: [sourceLibrary.crisis, sourceLibrary.privacy],
    actions: [actionLibrary.crisis],
    suggestions: ['Show me non-emergency resources', 'Explain Aether safety boundaries', 'What should the app do in crisis language?'],
    answer: () =>
      'I am not emergency support. If you or someone else may be in immediate danger, contact local emergency services now. In the United States, call or text 988 for the Suicide and Crisis Lifeline. For Aether product design, crisis language should pause normal AI guidance and route people to urgent support resources.',
  },
  {
    id: 'rag',
    label: 'Conversational RAG',
    keywords: ['rag', 'retrieval', 'vector', 'embedding', 'embeddings', 'index', 'chatbot', 'assistant', 'ai chat', 'conversational'],
    sources: [sourceLibrary.ragPlan, sourceLibrary.blog, sourceLibrary.home],
    actions: [actionLibrary.ragPlan, actionLibrary.ask],
    suggestions: ['How would static RAG work?', 'What content should be indexed?', 'How do we keep it lightweight?'],
    answer: () =>
      'The lightest path is static RAG: build a compact document index during deploy, load it server-side, embed the user question at runtime, search local vectors, and answer with citations. The UI added here is shaped so the current deterministic responder can later be replaced by the static RAG endpoint without changing the user experience.',
  },
  {
    id: 'next-step',
    label: 'Next step',
    keywords: [
      'next step',
      'where should i go',
      'where to start',
      'what should i do',
      'explore first',
      'drive me',
      'guide me',
      'available pages',
      'start',
    ],
    sources: [sourceLibrary.home, sourceLibrary.about, sourceLibrary.mentors],
    actions: [],
    suggestions: ['Explain this page', 'What pages are available right now?', 'How should I use Aether?'],
    answer: (context) => {
      const firstAction = context.actions[0]?.label ?? 'Open full copilot';
      return `Best next move from ${context.label}: use the first action card below, ${firstAction}, then ask one focused follow-up. I will keep you oriented with source cards and avoid sending you to pages that are currently turned off.`;
    },
  },
  {
    id: 'peer',
    label: 'Peer Navigator',
    keywords: ['peer', 'navigator', 'mentor match', 'matching', 'match', 'student support', 'lived experience', 'fairness'],
    sources: [sourceLibrary.peerNavigator, sourceLibrary.peerNetworkPlan, sourceLibrary.peerAlgorithm],
    actions: [actionLibrary.peerPlan, actionLibrary.matchingAlgorithm],
    suggestions: ['Explain peer matching', 'What safety gates are needed?', 'How should peer data be collected?'],
    answer: () =>
      'Peer Navigator should work as a safety-gated matching lifecycle, not a directory. A user gives consent, shares only useful matching preferences, passes immediate-help triage, receives explainable primary and backup suggestions, then gets check-ins, rematch, report, and closure controls. The reusable matching engine should stay generic while Peer-Navigator-specific gates live in its adapter.',
  },
  {
    id: 'privacy',
    label: 'Privacy and trust',
    keywords: ['privacy', 'safe', 'safety', 'data', 'consent', 'secret', 'env', 'hipaa', 'ferpa', 'governance'],
    sources: [sourceLibrary.privacy, sourceLibrary.ragPlan, sourceLibrary.peerNetworkPlan],
    actions: [actionLibrary.privacy, actionLibrary.about],
    suggestions: ['What information stays protected?', 'How does Aether keep answers trustworthy?', 'Explain privacy-first design'],
    answer: () =>
      'Aether should collect the minimum useful data, separate public display fields from private matching fields, and never index secrets such as `.env` files. For the assistant, public users should only get answers from approved content with citations. Sensitive or admin-only content should be filtered before retrieval.',
  },
  {
    id: 'resilience',
    label: 'Resilience pathway',
    keywords: ['resilience', 'pathway', 'habit', 'check-in', 'checkin', 'care navigation', 'support map', 'student wellbeing'],
    sources: [sourceLibrary.resilience, sourceLibrary.home, sourceLibrary.blog],
    actions: [actionLibrary.ask, actionLibrary.about],
    suggestions: ['What should a student do first?', 'How does care navigation work?', 'What is the support map?'],
    answer: () =>
      'The resilience pathway is the guided product route for students: reflect on what is happening, identify support needs, route to appropriate resources, and build repeatable recovery habits. It should feel practical and non-clinical, with clear safety boundaries when a concern becomes urgent.',
  },
  {
    id: 'echo',
    label: 'Echo Chamber',
    keywords: ['echo', 'voice', 'transcript', 'sentiment', 'reflection', 'journal', 'catharsis'],
    sources: [sourceLibrary.echo, sourceLibrary.privacy],
    actions: [actionLibrary.privacy, actionLibrary.ask],
    suggestions: ['What is Echo for?', 'How is Echo privacy-first?', 'How should sentiment be explained?'],
    answer: () =>
      'Echo is a private reflection surface for turning a spoken or typed moment into a clearer emotional map. The product should explain that sentiment signals are reflective support, not diagnosis, and keep local-first privacy boundaries visible.',
  },
  {
    id: 'admin',
    label: 'Admin page controls',
    keywords: ['admin', 'turn on', 'turn off', 'enabled', 'disabled', 'page controls', 'feature', 'menu'],
    sources: [sourceLibrary.admin, sourceLibrary.home],
    actions: [actionLibrary.home, actionLibrary.about, actionLibrary.mentors],
    suggestions: ['Which pages are default on?', 'How do admin page controls work?', 'Why is a page hidden?'],
    answer: () =>
      'Aether now defaults to Home, About, and Mentors as public pages. Other pages stay hidden until an admin enables them with runtime page controls or an explicit enabled-page environment allowlist. Navigation and route guards both read from the same page flag system.',
  },
  {
    id: 'fairness',
    label: 'Fairness governance',
    keywords: ['fairness', 'audit', 'parity', 'governance', 'quality floor', 'exposure', 'dashboard'],
    sources: [sourceLibrary.fairness, sourceLibrary.peerAlgorithm],
    actions: [actionLibrary.matchingAlgorithm, actionLibrary.peerPlan],
    suggestions: ['Explain exposure parity', 'How do fairness audits work?', 'What metrics matter?'],
    answer: () =>
      'Fairness governance should make matching behavior inspectable: exposure parity, quality parity, safety report patterns, response rates, and policy versions. Users should see simple explanation factors, while admins can audit aggregate metrics without exposing sensitive raw data broadly.',
  },
  {
    id: 'mentors',
    label: 'Mentors',
    keywords: ['mentor', 'mentors', 'pcss', 'staff', 'students', 'dedicated', 'teacher'],
    sources: [sourceLibrary.mentors, sourceLibrary.about],
    actions: [actionLibrary.mentors, actionLibrary.about],
    suggestions: ['Why are mentors highlighted?', 'Summarize mentor impact', 'What does the dedication mean?'],
    answer: () =>
      'The Mentors page frames mentorship as project infrastructure: guidance, ethics, encouragement, and rigor all shaped Aether. The footer dedication recognizes PCSS II students and staff as part of that human context behind the work.',
  },
  {
    id: 'about',
    label: 'About Aether',
    keywords: ['about', 'aether', 'what is', 'mission', 'overview', 'explain', 'product'],
    sources: [sourceLibrary.about, sourceLibrary.home],
    actions: [actionLibrary.about, actionLibrary.mentors, actionLibrary.ask],
    suggestions: ['Explain Aether simply', 'What problem does Aether solve?', 'Where should I start?'],
    answer: () =>
      'Aether is a privacy-first student resilience ecosystem. It combines guided reflection, support navigation, peer connection, transparent governance, and AI-readable content so students and support teams can understand the product without guesswork.',
  },
];

export function getAssistantContextProfile(pathname = '/') {
  const normalizedPath = normalizePath(pathname);
  const exact = contextProfiles.find((profile) => profile.path === normalizedPath);
  if (exact) {
    return exact;
  }

  const prefix = contextProfiles
    .filter((profile) => profile.path !== '/' && normalizedPath.startsWith(`${profile.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return prefix ?? contextProfiles[0];
}

export function getAssistantWelcome(pathname = '/'): AssistantReply {
  const context = getAssistantContextProfile(pathname);

  return {
    answer: `Hi, I am Aether's copilot. I can answer questions about this app, explain the current page, and drive you to the next useful step. ${context.summary}`,
    sources: [context.source],
    actions: context.actions,
    suggestions: context.suggestions,
    confidence: 'high',
    contextLabel: context.label,
  };
}

export function createAssistantReply(request: AssistantRequest): AssistantReply {
  const message = request.message.trim();
  const context = getAssistantContextProfile(request.contextPath);

  if (!message) {
    return getAssistantWelcome(request.contextPath);
  }

  const topic = selectTopic(message, context);
  const sources = dedupeSources([context.source, ...topic.sources]).slice(0, 4);
  const actions = dedupeActions([...topic.actions, ...context.actions]).slice(0, 3);
  const answer = buildContextualAnswer(topic, context, message);

  return {
    answer,
    sources,
    actions,
    suggestions: topic.suggestions,
    confidence: topic.id === 'about' && !hasStrongTopicSignal(message) ? 'medium' : 'high',
    contextLabel: context.label,
  };
}

function buildContextualAnswer(topic: AssistantTopic, context: AssistantContextProfile, message: string) {
  const asksAboutCurrentPage = /\b(this|current)\s+(page|screen|section)\b/i.test(message);
  if (asksAboutCurrentPage) {
    return `${context.summary} ${topic.answer(context)}`;
  }

  if (topic.id === 'crisis') {
    return topic.answer(context);
  }

  return `${topic.answer(context)}\n\nContext note: you asked from ${context.label}. ${context.summary}`;
}

function selectTopic(message: string, context: AssistantContextProfile) {
  const normalizedMessage = normalizeText(message);
  const scored = topics.map((topic) => {
    const keywordScore = topic.keywords.reduce((score, keyword) => {
      return normalizedMessage.includes(normalizeText(keyword)) ? score + keyword.split(' ').length : score;
    }, 0);
    const contextScore = topic.label === context.label ? 1.5 : 0;
    return {
      topic,
      score: keywordScore + contextScore,
    };
  });

  scored.sort((left, right) => right.score - left.score);
  return scored[0]?.score > 0 ? scored[0].topic : topics.find((topic) => topic.id === 'about') ?? topics[0];
}

function hasStrongTopicSignal(message: string) {
  const normalizedMessage = normalizeText(message);
  return topics.some((topic) =>
    topic.id !== 'about' && topic.keywords.some((keyword) => normalizedMessage.includes(normalizeText(keyword))),
  );
}

function dedupeSources(sources: AssistantSource[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.href)) {
      return false;
    }

    seen.add(source.href);
    return true;
  });
}

function dedupeActions(actions: AssistantAction[]) {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.href)) {
      return false;
    }

    seen.add(action.href);
    return true;
  });
}

function normalizePath(pathname: string) {
  if (!pathname) {
    return '/';
  }

  const withoutQuery = pathname.split('?')[0].split('#')[0];
  const normalized = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  return normalized.replace(/\/+$/, '') || '/';
}

function normalizeText(input: string) {
  return input.toLowerCase().replace(/\s+/g, ' ').trim();
}
