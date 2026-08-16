import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Config, Data } from '@puckeditor/core';
import AetherLogoLockup from '../../components/brand/AetherLogoLockup';
import { CardGrid, LinkCardGrid, SurfaceCard } from '../../components/page/PagePrimitives';
import { markdownToHtml } from '../markdown';
import { homeFaqs, homeFeatureHighlights, homeStartOptions, homeValueCards } from '../home-page';
import {
  featuredMentors,
  mentorConstellationNodes,
  mentorContributionPillars,
  mentorFAQs,
  mentorImpactStats,
  mentorRecognitionRituals,
} from '../mentor-recognition';
import { hubBenchmarkInsights, hubSupportLanes, resiliencePathwayStages, researchReferences } from '../resilience-model';
import type { VoiceCapture } from '../local-ai';
import type { CmsPageDefinition } from './page-registry';

const AetherAssistant = dynamic(() => import('../../components/assistant/AetherAssistant'), { ssr: false });
const FeedbackIntake = dynamic(() => import('../../components/feedback/FeedbackIntake'), { ssr: false });
const FairnessAuditDashboard = dynamic(() => import('../../components/FairnessAuditDashboard'), { ssr: false });
const VoiceRecorder = dynamic(() => import('../../components/echo/VoiceRecorder'), { ssr: false });
const SentimentMapping = dynamic(() => import('../../components/echo/SentimentMapping'), { ssr: false });
const WellbeingCheckIn = dynamic(() => import('../../components/resilience/WellbeingCheckIn'), { ssr: false });
const SafetyPlanBuilder = dynamic(() => import('../../components/resilience/SafetyPlanBuilder'), { ssr: false });
const ResourceNavigator = dynamic(() => import('../../components/resilience/ResourceNavigator'), { ssr: false });
const PeerCircleMatcher = dynamic(() => import('../../components/resilience/PeerCircleMatcher'), { ssr: false });
const HabitPlanner = dynamic(() => import('../../components/resilience/HabitPlanner'), { ssr: false });

type LinkAction = { href: string; label: string };
type SectionColumns = 'two' | 'three' | 'four';

type MetricItem = { label: string; value: string; description: string };
type CardItem = { eyebrow?: string; title: string; description: string; href?: string; hrefLabel?: string };

type HeroBlockProps = { kicker?: string; title: string; description: string };
type MarkdownBlockProps = { eyebrow?: string; title?: string; body: string };
type ActionBlockProps = { primaryAction?: LinkAction; secondaryAction?: LinkAction };
type MetricsBlockProps = { title?: string; items: MetricItem[] };
type CardGridBlockProps = { eyebrow?: string; title: string; description?: string; columns?: SectionColumns; items: CardItem[] };
type FaqBlockProps = { title?: string; items: Array<{ question: string; answer: string }> };
type BadgeListBlockProps = { title?: string; items: string[] };
type NoticeBlockProps = { kicker?: string; title?: string; description: string; link?: LinkAction };
type AskAssistantBlockProps = { kicker?: string; title: string; description?: string; starterPrompts?: string[] };
type FeedbackFormBlockProps = { kicker?: string; title: string; description: string; productName?: string };
type FairnessDashboardBlockProps = { kicker?: string; title: string; description?: string };
type EchoStudioBlockProps = { kicker?: string; title: string; description?: string };
type ResilienceToolkitBlockProps = { kicker?: string; title: string; description?: string };
type HomeHeroBlockProps = {
  kicker?: string;
  title: string;
  description: string;
  primaryAction?: LinkAction;
  secondaryAction?: LinkAction;
  assistantAction?: LinkAction;
  trustSignals?: Array<{ value: string }>;
  proofPoints?: Array<{ value: string; label: string }>;
};
type HomeJourneyDockBlockProps = {
  items?: Array<{ title: string; description: string }>;
};
type HomeStartOptionsBlockProps = {
  eyebrow?: string;
  title: string;
  description: string;
  items?: Array<{ title: string; description: string; href: string }>;
};
type HomeFeatureGridBlockProps = {
  eyebrow?: string;
  title: string;
  description: string;
  items?: Array<{ title: string; description: string; eyebrow?: string; href?: string; hrefLabel?: string }>;
};
type HomeReturnLoopBlockProps = {
  exploreKicker?: string;
  exploreTitle: string;
  exploreDescription: string;
  exploreItems?: Array<{ title: string; description: string; href: string }>;
  retentionKicker?: string;
  retentionTitle: string;
  retentionItems?: Array<{ title: string; description: string }>;
};
type HomeFaqBlockProps = {
  kicker?: string;
  title: string;
  items?: Array<{ question: string; answer: string }>;
};
type GlobalHeaderBlockProps = {
  bannerText?: string;
  bannerVariant?: 'emerald' | 'sky' | 'slate' | 'amber';
  surfaceVariant?: 'glass' | 'solid' | 'calm';
  trustBarVariant?: 'mint' | 'slate' | 'sky';
  siteName?: string;
  tagline?: string;
  logoHref?: string;
  logoAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaDescription?: string;
  feedbackLabel?: string;
  explorePrimaryTitle?: string;
  explorePrimaryDescription?: string;
  exploreSecondaryTitle?: string;
  exploreSecondaryDescription?: string;
  mobilePrimaryDescription?: string;
  mobileSecondaryDescription?: string;
  trustSignals?: Array<{ value: string }>;
  primaryNavigation?: Array<{ label: string; href: string; description?: string; external?: string | boolean }>;
  secondaryNavigation?: Array<{ label: string; href: string; description?: string; external?: string | boolean }>;
};
type GlobalFooterBlockProps = {
  surfaceVariant?: 'glass' | 'white' | 'mint';
  accentVariant?: 'teal' | 'slate' | 'indigo';
  summaryText?: string;
  safetyTitle?: string;
  safetyNote?: string;
  copyrightText?: string;
  socialSharePath?: string;
  socialShareTitle?: string;
  badgeHref?: string;
  badgeAriaLabel?: string;
  dedicationLabel?: string;
  dedicationHref?: string;
  attributionPrefix?: string;
  authorName?: string;
  authorUrl?: string;
  authorLinkLabel?: string;
  trustSignals?: Array<{ value: string }>;
  navigationLinks?: Array<{
    groupTitle: string;
    label: string;
    href: string;
    description?: string;
    external?: string | boolean;
  }>;
};

type InfoLikeConfig = {
  kicker?: string;
  title: string;
  description: string;
  primaryAction?: LinkAction;
  secondaryAction?: LinkAction;
  metrics?: MetricItem[];
  itemSection?: { eyebrow?: string; title: string; description?: string; columns?: SectionColumns };
  items: CardItem[];
  sections?: Array<{ eyebrow?: string; title: string; description?: string; columns?: SectionColumns; items: CardItem[] }>;
  footerNote?: string;
  footerLink?: LinkAction;
};

const aboutCmsSeed: InfoLikeConfig = {
  kicker: 'Aether Platform',
  title: 'About Aether',
  description:
    'Aether is a privacy-first student resilience ecosystem that helps students reflect, understand what kind of support fits the moment, and move toward safer next steps without pretending to be therapy or emergency care.',
  primaryAction: { href: '/resilience-pathway', label: 'Open Resilience Hub' },
  secondaryAction: { href: '/privacy', label: 'Review Privacy Model' },
  metrics: [
    { value: '5', label: 'support modules', description: 'Reflection, check-ins, safety planning, resource routing, and peer connection.' },
    { value: '0', label: 'diagnostic claims', description: 'Aether supports awareness and navigation; it does not diagnose, treat, or replace care.' },
    { value: 'Local', label: 'privacy posture', description: 'Sensitive reflection experiences are designed around data minimization and local-first patterns.' },
    { value: 'Modular', label: 'deployment model', description: 'Campuses and teams can enable, disable, or swap pathways without rebuilding the product.' },
  ],
  itemSection: {
    eyebrow: 'Platform map',
    title: 'How Aether fits together',
    description: 'Each capability can stand alone, but the complete system gives students a coherent path from reflection to support.',
  },
  items: [
    {
      title: 'Echo Chamber',
      description: 'A private voice reflection space where students can process stress and receive local sentiment and safety cues without turning reflection into a public record.',
      href: '/echo',
      hrefLabel: 'Explore Echo Chamber',
      eyebrow: 'Reflect',
    },
    {
      title: 'Peer-Navigator',
      description: 'A privacy-aware matching experience designed to improve belonging while preserving identity safety and fairness review.',
      href: '/peer-navigator',
      hrefLabel: 'Open Peer-Navigator',
      eyebrow: 'Connect',
    },
    {
      title: 'Resilience Pathway',
      description: 'A modular intervention flow covering check-ins, safety planning, resource routing, peer circles, and sustainable habits.',
      href: '/resilience-pathway',
      hrefLabel: 'View Resilience Pathway',
      eyebrow: 'Navigate',
    },
    {
      title: 'Privacy and Governance',
      description: 'Designed with local-first processing, transparent policy boundaries, and fairness-focused auditability.',
      href: '/privacy',
      hrefLabel: 'Read Privacy Commitments',
      eyebrow: 'Trust',
    },
  ],
  footerNote: 'Aether is designed as a humane support layer: practical, privacy-aware, and careful about its limits.',
};

const accessibilityCmsSeed: InfoLikeConfig = {
  kicker: 'Inclusive Design',
  title: 'Accessibility and SAFE-AI Compliance',
  description: 'Aether is built for readability, keyboard access, and fairness-aware AI behavior across different user contexts.',
  items: [
    {
      title: 'Accessibility Baseline',
      description: 'Interfaces target WCAG 2.1 AA with keyboard navigation, clear focus states, and robust semantic markup.',
      href: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
      hrefLabel: 'Review WCAG Guidelines',
    },
    { title: 'Safe Interaction Patterns', description: 'Visual hierarchy, language clarity, and low-cognitive-load flows are prioritized for student wellbeing scenarios.' },
    {
      title: 'SAFE-AI Governance',
      description: 'Model behavior, triage messaging, and fairness checks are reviewed under documented governance controls.',
      href: '/fairness-governance',
      hrefLabel: 'View Fairness Dashboard',
    },
  ],
  footerNote: 'Need assistance or want to report an issue?',
  footerLink: { href: 'mailto:accessibility@aether.org', label: 'Contact accessibility support' },
};

const privacyCmsSeed: InfoLikeConfig = {
  kicker: 'Privacy by Design',
  title: 'Privacy and Data Ethics',
  description: 'Student wellbeing workflows are built to minimize data exposure while preserving practical support outcomes.',
  items: [
    { title: 'Local-First Processing', description: 'Sensitive voice and sentiment analysis stay on-device by default to reduce data transfer and central retention.' },
    { title: 'Identity Safety Patterns', description: 'System interactions prioritize pseudonymity, constrained metadata, and explicit consent boundaries.' },
    {
      title: 'Ethical AI Controls',
      description: 'Fairness checkpoints and escalation boundaries are reviewed to avoid overreach in high-sensitivity contexts.',
      href: '/fairness-governance',
      hrefLabel: 'Inspect Governance Controls',
    },
  ],
  footerNote: 'For mission context and architecture background, continue to the About page.',
  footerLink: { href: '/about', label: 'Go to About' },
};

let blockIdCounter = 0;
function makeBlockId(type: string): string {
  blockIdCounter += 1;
  return `${type}-${Date.now()}-${blockIdCounter}`;
}

function withBlock<T extends Record<string, unknown>>(type: string, props: T) {
  return {
    type,
    props: {
      ...props,
      id: typeof props.id === 'string' && props.id.trim().length > 0 ? props.id : makeBlockId(type),
    },
  };
}

export function ensureContentIds(data: Data): Data {
  const content = Array.isArray(data.content) ? data.content : [];
  return {
    ...data,
    content: content.map((item) => {
      const type = typeof item.type === 'string' ? item.type : 'Block';
      const props = (item.props ?? {}) as Record<string, unknown>;
      if (typeof props.id === 'string' && props.id.trim().length > 0) return item;
      return { ...item, props: { ...props, id: makeBlockId(type) } };
    }),
  };
}

function MarkdownBody({ body }: { body?: string }) {
  if (!body) return null;
  return (
    <div
      className="prose prose-slate max-w-none text-[color:var(--theme-text-muted)] prose-headings:text-[color:var(--theme-text)] prose-a:text-[color:var(--theme-primary-strong)]"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }}
    />
  );
}

function HeroBlock(props: HeroBlockProps) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.kicker}</p> : null}
      <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{props.title}</h1>
      <p className="mt-3 text-base leading-7 text-slate-700">{props.description}</p>
    </section>
  );
}

function MarkdownBlock(props: MarkdownBlockProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.eyebrow}</p> : null}
      {props.title ? <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2> : null}
      <div className={props.title || props.eyebrow ? 'mt-3' : ''}><MarkdownBody body={props.body} /></div>
    </section>
  );
}

function ActionBlock(props: ActionBlockProps) {
  if (!props.primaryAction && !props.secondaryAction) return null;
  return (
    <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row">
        {props.primaryAction ? <a href={props.primaryAction.href} className="rounded-lg bg-emerald-800 px-5 py-3 text-center text-white no-underline hover:bg-emerald-900">{props.primaryAction.label}</a> : null}
        {props.secondaryAction ? <a href={props.secondaryAction.href} className="rounded-lg border border-emerald-200 bg-white px-5 py-3 text-center text-emerald-900 no-underline hover:bg-emerald-50">{props.secondaryAction.label}</a> : null}
      </div>
    </section>
  );
}

function MetricsBlock(props: MetricsBlockProps) {
  if (!props.items?.length) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.title ? <h2 className="text-2xl font-black text-slate-950">{props.title}</h2> : null}
      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${props.title ? 'mt-4' : ''}`}>
        {props.items.map((metric, index) => (
          <article key={`${metric.label}-${index}`} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-2xl font-black text-emerald-900">{metric.value}</p>
            <h3 className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-slate-900">{metric.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{metric.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CardGridBlock(props: CardGridBlockProps) {
  if (!props.items?.length) return null;
  const columnClass = props.columns === 'four' ? 'sm:grid-cols-2 lg:grid-cols-4' : props.columns === 'three' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2';
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2>
      {props.description ? <p className="mt-2 text-sm leading-7 text-slate-700">{props.description}</p> : null}
      <div className={`mt-5 grid grid-cols-1 gap-4 ${columnClass}`}>
        {props.items.map((item, index) => (
          <article key={`${item.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {item.eyebrow ? <p className="text-xs font-black uppercase tracking-[0.1em] text-emerald-800">{item.eyebrow}</p> : null}
            <h3 className="mt-1 text-base font-black text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
            {item.href && item.hrefLabel ? <a href={item.href} className="mt-3 inline-flex text-sm font-semibold text-emerald-800 no-underline hover:underline">{item.hrefLabel}</a> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqBlock(props: FaqBlockProps) {
  if (!props.items?.length) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-black text-slate-950">{props.title ?? 'Common Questions'}</h2>
      <div className="mt-4 space-y-3">
        {props.items.map((faq, index) => (
          <details key={`${faq.question}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{faq.question}</summary>
            <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function BadgeListBlock(props: BadgeListBlockProps) {
  if (!props.items?.length) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.title ? <h2 className="text-2xl font-black text-slate-950">{props.title}</h2> : null}
      <div className={`flex flex-wrap gap-2 ${props.title ? 'mt-4' : ''}`}>
        {props.items.map((item, index) => (
          <span key={`${item}-${index}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">{item}</span>
        ))}
      </div>
    </section>
  );
}

function NoticeBlock(props: NoticeBlockProps) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">{props.kicker}</p> : null}
      {props.title ? <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2> : null}
      <p className={props.title || props.kicker ? 'mt-3 text-sm leading-7 text-slate-700' : 'text-sm leading-7 text-slate-700'}>{props.description}</p>
      {props.link ? <a href={props.link.href} className="mt-3 inline-flex text-sm font-semibold text-amber-900 no-underline hover:underline">{props.link.label}</a> : null}
    </section>
  );
}

function AskAssistantBlock(props: AskAssistantBlockProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2>
      {props.description ? <p className="mt-2 text-sm leading-7 text-slate-700">{props.description}</p> : null}
      <div className="mt-4"><AetherAssistant variant="page" starterPrompts={props.starterPrompts ?? []} /></div>
    </section>
  );
}

function FeedbackFormBlock(props: FeedbackFormBlockProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">{props.description}</p>
      <div className="mt-5"><FeedbackIntake productName={props.productName ?? 'Aether'} title={props.title} description={props.description} /></div>
    </section>
  );
}

function FairnessDashboardBlock(props: FairnessDashboardBlockProps) {
  const [fairnessData, setFairnessData] = React.useState<{
    metrics: Array<{ cohort: string; populationShare: number; candidateExposure: number; matchExposure: number; exposureParity: number; averageQuality: number; qualityAboveFloor: number; matchCount: number; fairnessAdjustmentCount: number; avgAdjustmentMagnitude: number }>;
    auditLog: Array<{ timestamp: string; cycleId: string; userA: string; userB: string; cohortA: string; cohortB: string; phase1Score: number; phase2Score: number; fairnessAdjustment: number; adjustmentReason: string; finalScore: number; matchAccepted: boolean }>;
    policy: { exposureParityBand: number; underExposureBoost: number; overExposurePenalty: number; qualityFloor: number; version: string; lastReviewDate: string; reviewer: string; approvalStatus: 'approved' | 'under-review' | 'rejected' };
    generatedAt: string;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const { generateMockFairnessData } = await import('../../components/FairnessAuditDashboard');
      if (!cancelled) setFairnessData(generateMockFairnessData());
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2>
      {props.description ? <p className="mt-2 text-sm leading-7 text-slate-700">{props.description}</p> : null}
      <div className="mt-5">
        {fairnessData ? (
          <FairnessAuditDashboard
            metrics={fairnessData.metrics}
            auditLog={fairnessData.auditLog}
            policy={fairnessData.policy}
            totalMatches={fairnessData.metrics.reduce((sum, metric) => sum + metric.matchCount, 0)}
            totalCycles={Math.ceil(fairnessData.metrics.reduce((sum, metric) => sum + metric.matchCount, 0) / 5)}
            lastUpdated={fairnessData.generatedAt}
          />
        ) : (
          <p className="text-sm text-slate-600">Loading fairness dashboard...</p>
        )}
      </div>
    </section>
  );
}

function EchoStudioBlock(props: EchoStudioBlockProps) {
  const [capture, setCapture] = React.useState<VoiceCapture | null>(null);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2>
      {props.description ? <p className="mt-2 text-sm leading-7 text-slate-700">{props.description}</p> : null}
      <div className="mt-5 space-y-4">
        <VoiceRecorder onCaptureComplete={setCapture} />
        <SentimentMapping audio={capture?.audio ?? null} transcript={capture?.transcript ?? ''} transcriptSource={capture?.transcriptSource ?? 'unavailable'} />
      </div>
    </section>
  );
}

function ResilienceToolkitBlock(props: ResilienceToolkitBlockProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {props.kicker ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{props.kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-950">{props.title}</h2>
      {props.description ? <p className="mt-2 text-sm leading-7 text-slate-700">{props.description}</p> : null}
      <div className="mt-5 space-y-5">
        <WellbeingCheckIn />
        <SafetyPlanBuilder />
        <ResourceNavigator />
        <PeerCircleMatcher />
        <HabitPlanner />
      </div>
    </section>
  );
}

function HomeHeroBlock(props: HomeHeroBlockProps) {
  const trustSignals = Array.isArray(props.trustSignals)
    ? props.trustSignals.map((item) => item.value).filter((item) => item.length > 0)
    : [];
  const proofPoints = Array.isArray(props.proofPoints) ? props.proofPoints : [];
  const actions = [props.primaryAction].filter(
    (action): action is LinkAction => Boolean(action?.href && action?.label),
  );

  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        <div className="home-hero-copy-block">
          {props.kicker ? <p className="theme-kicker">{props.kicker}</p> : null}
          <h1 className="home-hero-title">{props.title}</h1>
          <p className="home-hero-copy">{props.description}</p>
          <p className="home-hero-reassurance">There is no perfect way to begin. Take this one moment at a time.</p>
          <div className="home-hero-actions">
            {actions.map((action, index) => {
              const className =
                index === 0
                  ? 'theme-button theme-button-accent w-full px-6 py-3 sm:w-auto'
                  : 'theme-button theme-button-primary w-full px-6 py-3 sm:w-auto';

              return (
                <Link key={`${action.href}-${action.label}`} href={action.href} className={className}>
                  {action.label}
                </Link>
              );
            })}
            {props.assistantAction?.href && props.assistantAction?.label ? (
              <Link
                href={props.assistantAction.href}
                className="theme-button theme-button-secondary w-full px-6 py-3 sm:w-auto"
              >
                {props.assistantAction.label}
              </Link>
            ) : null}
          </div>
          <div className="home-hero-signals">
            {trustSignals.map((signal) => (
              <span key={signal} className="theme-pill">
                {signal}
              </span>
            ))}
          </div>
        </div>

        <aside className="home-hero-compass" aria-label="Aether resilience compass">
          <div className="home-logo-mark">
            <AetherLogoLockup className="home-logo-svg" />
          </div>
          <div className="home-proof-grid">
            {proofPoints.map((point) => (
              <article key={`${point.value}-${point.label}`} className="home-proof-card">
                <strong>{point.value}</strong>
                <span>{point.label}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function HomeJourneyDockBlock(props: HomeJourneyDockBlockProps) {
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <section className="home-journey-dock">
      <div className="home-journey-grid theme-shell">
        {items.map((item) => (
          <article key={`${item.title}-${item.description}`} className="home-journey-card theme-card">
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeStartOptionsBlock(props: HomeStartOptionsBlockProps) {
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <section id="first-step" className="theme-shell scroll-mt-24 space-y-6">
      <div className="home-section-heading">
        {props.eyebrow ? <p className="theme-kicker">{props.eyebrow}</p> : null}
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      <LinkCardGrid items={items} />
    </section>
  );
}

function HomeFeatureGridBlock(props: HomeFeatureGridBlockProps) {
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <section className="theme-shell space-y-6">
      <div className="home-section-heading">
        {props.eyebrow ? <p className="theme-kicker">{props.eyebrow}</p> : null}
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      <CardGrid items={items} columns="four" titleLevel="h2" className="text-left" />
    </section>
  );
}

function HomeReturnLoopBlock(props: HomeReturnLoopBlockProps) {
  const exploreItems = Array.isArray(props.exploreItems) ? props.exploreItems : [];
  const retentionItems = Array.isArray(props.retentionItems) ? props.retentionItems : [];

  return (
    <section className="theme-shell home-return-loop">
      <SurfaceCard className="home-return-panel">
        {props.exploreKicker ? <p className="theme-kicker">{props.exploreKicker}</p> : null}
        <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--theme-text)] md:text-4xl">{props.exploreTitle}</h2>
        <p className="mt-4 leading-7 text-[color:var(--theme-text-muted)]">{props.exploreDescription}</p>
        <LinkCardGrid className="mt-6" items={exploreItems} />
      </SurfaceCard>

      <SurfaceCard className="home-return-panel">
        {props.retentionKicker ? <p className="theme-kicker">{props.retentionKicker}</p> : null}
        <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--theme-text)] md:text-4xl">{props.retentionTitle}</h2>
        <div className="home-signal-list mt-6">
          {retentionItems.map((item) => (
            <article key={`${item.title}-${item.description}`} className="home-signal-item">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </section>
  );
}

function HomeFaqBlock(props: HomeFaqBlockProps) {
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <section className="theme-shell">
      <SurfaceCard className="home-return-panel">
        <div className="home-section-heading">
          {props.kicker ? <p className="theme-kicker">{props.kicker}</p> : null}
          <h2>{props.title}</h2>
        </div>
        <CardGrid
          items={items.map((item) => ({ title: item.question, description: item.answer }))}
          columns="two"
          className="mt-6"
        />
      </SurfaceCard>
    </section>
  );
}

function GlobalHeaderBlock(props: GlobalHeaderBlockProps) {
  const preview =
    typeof props.bannerText === 'string' && props.bannerText.trim().length > 0
      ? props.bannerText
      : 'No banner text set. Header renders without a banner.';
  const primaryCount = Array.isArray(props.primaryNavigation) ? props.primaryNavigation.length : 0;
  const secondaryCount = Array.isArray(props.secondaryNavigation) ? props.secondaryNavigation.length : 0;
  const trustCount = Array.isArray(props.trustSignals) ? props.trustSignals.length : 0;
  const bannerVariant =
    props.bannerVariant === 'sky' || props.bannerVariant === 'slate' || props.bannerVariant === 'amber'
      ? props.bannerVariant
      : 'emerald';
  const surfaceVariant = props.surfaceVariant === 'solid' || props.surfaceVariant === 'calm' ? props.surfaceVariant : 'glass';
  const trustBarVariant = props.trustBarVariant === 'slate' || props.trustBarVariant === 'sky' ? props.trustBarVariant : 'mint';

  const bannerPreviewClass: Record<typeof bannerVariant, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    slate: 'border-slate-300 bg-slate-100 text-slate-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  const bannerMarkerClass: Record<typeof bannerVariant, string> = {
    emerald: 'rounded-full bg-current opacity-70',
    sky: 'rounded-full bg-current opacity-70',
    slate: 'rounded-sm bg-current opacity-70',
    amber: 'rounded-sm bg-current opacity-70',
  };
  const surfacePreviewClass: Record<typeof surfaceVariant, string> = {
    glass: 'border-slate-200 bg-white/90 text-slate-700',
    solid: 'border-slate-300 bg-white text-slate-700',
    calm: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  };
  const surfaceMarkerClass: Record<typeof surfaceVariant, string> = {
    glass: 'rounded-full border border-current bg-transparent opacity-80',
    solid: 'rounded-sm bg-current opacity-70',
    calm: 'rounded-sm bg-current opacity-70 rotate-45',
  };
  const trustBarPreviewClass: Record<typeof trustBarVariant, string> = {
    mint: 'border-emerald-200 bg-emerald-100/70 text-emerald-900',
    slate: 'border-slate-300 bg-slate-200 text-slate-900',
    sky: 'border-sky-200 bg-sky-100 text-sky-900',
  };
  const trustBarMarkerClass: Record<typeof trustBarVariant, string> = {
    mint: 'rounded-full bg-current opacity-70',
    slate: 'rounded-sm bg-current opacity-70',
    sky: 'rounded-full border border-current bg-transparent opacity-80',
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Global Header</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Header Shell Configuration</h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">Banner, branding, CTA, navigation menus, and trust chips.</p>
      <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{preview}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <p className="rounded-lg bg-slate-100 px-3 py-2">Primary links: {primaryCount}</p>
        <p className="rounded-lg bg-slate-100 px-3 py-2">Secondary links: {secondaryCount}</p>
        <p className="rounded-lg bg-slate-100 px-3 py-2">Trust chips: {trustCount}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-[0.08em]">
        <span className={`rounded-full border px-2.5 py-1 ${bannerPreviewClass[bannerVariant]}`}>
          <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ${bannerMarkerClass[bannerVariant]}`} />
          Banner: {bannerVariant}
        </span>
        <span className={`rounded-full border px-2.5 py-1 ${surfacePreviewClass[surfaceVariant]}`}>
          <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ${surfaceMarkerClass[surfaceVariant]}`} />
          Surface: {surfaceVariant}
        </span>
        <span className={`rounded-full border px-2.5 py-1 ${trustBarPreviewClass[trustBarVariant]}`}>
          <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ${trustBarMarkerClass[trustBarVariant]}`} />
          Trust bar: {trustBarVariant}
        </span>
      </div>
    </section>
  );
}

function GlobalFooterBlock(props: GlobalFooterBlockProps) {
  const summary =
    typeof props.summaryText === 'string' && props.summaryText.trim().length > 0
      ? props.summaryText
      : 'No summary text set.';
  const safety =
    typeof props.safetyNote === 'string' && props.safetyNote.trim().length > 0
      ? props.safetyNote
      : 'No safety note set.';
  const copyright =
    typeof props.copyrightText === 'string' && props.copyrightText.trim().length > 0
      ? props.copyrightText
      : 'No copyright text set.';
  const navCount = Array.isArray(props.navigationLinks) ? props.navigationLinks.length : 0;
  const trustCount = Array.isArray(props.trustSignals) ? props.trustSignals.length : 0;
  const surfaceVariant = props.surfaceVariant === 'white' || props.surfaceVariant === 'mint' ? props.surfaceVariant : 'glass';
  const accentVariant = props.accentVariant === 'slate' || props.accentVariant === 'indigo' ? props.accentVariant : 'teal';

  const surfacePreviewClass: Record<typeof surfaceVariant, string> = {
    glass: 'border-slate-200 bg-white/90 text-slate-700',
    white: 'border-slate-300 bg-white text-slate-700',
    mint: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  };
  const surfaceMarkerClass: Record<typeof surfaceVariant, string> = {
    glass: 'rounded-full border border-current bg-transparent opacity-80',
    white: 'rounded-sm bg-current opacity-70',
    mint: 'rounded-full bg-current opacity-70',
  };
  const accentPreviewClass: Record<typeof accentVariant, string> = {
    teal: 'border-teal-300 bg-teal-100 text-teal-900',
    slate: 'border-slate-400 bg-slate-200 text-slate-900',
    indigo: 'border-indigo-300 bg-indigo-100 text-indigo-900',
  };
  const accentMarkerClass: Record<typeof accentVariant, string> = {
    teal: 'rounded-full bg-current opacity-70',
    slate: 'rounded-sm bg-current opacity-70',
    indigo: 'rounded-sm bg-current opacity-70 rotate-45',
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Global Footer</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Footer Shell Configuration</h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">Summary, safety, navigation groups, trust chips, share metadata, and attribution.</p>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <div>
          <p className="font-semibold text-slate-900">Summary</p>
          <p className="rounded-lg bg-slate-100 p-3">{summary}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Safety Note</p>
          <p className="rounded-lg bg-slate-100 p-3">{safety}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Copyright Text</p>
          <p className="rounded-lg bg-slate-100 p-3">{copyright}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        <p className="rounded-lg bg-slate-100 px-3 py-2">Footer link rows: {navCount}</p>
        <p className="rounded-lg bg-slate-100 px-3 py-2">Trust chips: {trustCount}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-[0.08em]">
        <span className={`rounded-full border px-2.5 py-1 ${surfacePreviewClass[surfaceVariant]}`}>
          <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ${surfaceMarkerClass[surfaceVariant]}`} />
          Surface: {surfaceVariant}
        </span>
        <span className={`rounded-full border px-2.5 py-1 ${accentPreviewClass[accentVariant]}`}>
          <span aria-hidden="true" className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ${accentMarkerClass[accentVariant]}`} />
          Accent: {accentVariant}
        </span>
      </div>
    </section>
  );
}

export const cmsPuckConfig: Config = {
  components: {
    HeroBlock: {
      fields: { kicker: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' } },
      defaultProps: { title: 'Page title', description: 'Page description' },
      render: (data) => <HeroBlock {...(data as unknown as HeroBlockProps)} />,
    },
    MarkdownBlock: {
      fields: { eyebrow: { type: 'text' }, title: { type: 'text' }, body: { type: 'textarea' } },
      defaultProps: { title: 'Section title', body: 'Write section body.' },
      render: (data) => <MarkdownBlock {...(data as unknown as MarkdownBlockProps)} />,
    },
    ActionBlock: {
      fields: {
        primaryAction: { type: 'object', objectFields: { href: { type: 'text' }, label: { type: 'text' } } },
        secondaryAction: { type: 'object', objectFields: { href: { type: 'text' }, label: { type: 'text' } } },
      },
      defaultProps: {},
      render: (data) => <ActionBlock {...(data as unknown as ActionBlockProps)} />,
    },
    MetricsBlock: {
      fields: {
        title: { type: 'text' },
        items: { type: 'array', defaultItemProps: { label: 'Metric', value: '0', description: 'Supporting context' }, arrayFields: { label: { type: 'text' }, value: { type: 'text' }, description: { type: 'textarea' } } },
      },
      defaultProps: { title: 'Highlights', items: [] },
      render: (data) => <MetricsBlock {...(data as unknown as MetricsBlockProps)} />,
    },
    CardGridBlock: {
      fields: {
        eyebrow: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'textarea' },
        columns: { type: 'select', options: [{ label: 'Two', value: 'two' }, { label: 'Three', value: 'three' }, { label: 'Four', value: 'four' }] },
        items: { type: 'array', defaultItemProps: { title: 'Card title', description: 'Card body' }, arrayFields: { eyebrow: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' }, href: { type: 'text' }, hrefLabel: { type: 'text' } } },
      },
      defaultProps: { title: 'Section title', columns: 'two', items: [] },
      render: (data) => <CardGridBlock {...(data as unknown as CardGridBlockProps)} />,
    },
    FaqBlock: {
      fields: { title: { type: 'text' }, items: { type: 'array', defaultItemProps: { question: 'Question', answer: 'Answer' }, arrayFields: { question: { type: 'text' }, answer: { type: 'textarea' } } } },
      defaultProps: { title: 'Common Questions', items: [] },
      render: (data) => <FaqBlock {...(data as unknown as FaqBlockProps)} />,
    },
    BadgeListBlock: {
      fields: { title: { type: 'text' }, items: { type: 'array', defaultItemProps: { value: 'Badge label' }, arrayFields: { value: { type: 'text' } } } },
      defaultProps: { title: 'Badges', items: [] },
      render: (data) => {
        const props = data as unknown as Record<string, unknown>;
        const rawItems = Array.isArray(props.items) ? props.items : [];
        const normalized = rawItems.map((item) => (typeof item?.value === 'string' ? item.value : '')).filter((item) => item.length > 0);
        return <BadgeListBlock title={(props.title as string) ?? ''} items={normalized} />;
      },
    },
    AskAssistantBlock: {
      fields: {
        kicker: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'textarea' },
        starterPrompts: { type: 'array', defaultItemProps: { value: 'Add starter prompt' }, arrayFields: { value: { type: 'text' } } },
      },
      defaultProps: { title: 'Ask Aether assistant', description: 'Interactive assistant module.', starterPrompts: [] },
      render: (data) => {
        const props = data as unknown as Record<string, unknown>;
        const rawItems = Array.isArray(props.starterPrompts) ? props.starterPrompts : [];
        const starterPrompts = rawItems.map((item) => (typeof item?.value === 'string' ? item.value : '')).filter((item) => item.length > 0);
        return <AskAssistantBlock kicker={typeof props.kicker === 'string' ? props.kicker : undefined} title={typeof props.title === 'string' ? props.title : 'Ask Aether assistant'} description={typeof props.description === 'string' ? props.description : ''} starterPrompts={starterPrompts} />;
      },
    },
    FeedbackFormBlock: {
      fields: { kicker: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' }, productName: { type: 'text' } },
      defaultProps: { title: 'Feedback Observatory', description: 'Collect product signals from users.', productName: 'Aether' },
      render: (data) => <FeedbackFormBlock {...(data as unknown as FeedbackFormBlockProps)} />,
    },
    FairnessDashboardBlock: {
      fields: { kicker: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' } },
      defaultProps: { title: 'Fairness audit dashboard', description: 'Interactive fairness and governance dashboard.' },
      render: (data) => <FairnessDashboardBlock {...(data as unknown as FairnessDashboardBlockProps)} />,
    },
    EchoStudioBlock: {
      fields: { kicker: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' } },
      defaultProps: { title: 'Echo reflection studio', description: 'Voice recorder and local sentiment mapping.' },
      render: (data) => <EchoStudioBlock {...(data as unknown as EchoStudioBlockProps)} />,
    },
    ResilienceToolkitBlock: {
      fields: { kicker: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' } },
      defaultProps: { title: 'Resilience toolkit modules', description: 'Interactive check-in, planning, and support tools.' },
      render: (data) => <ResilienceToolkitBlock {...(data as unknown as ResilienceToolkitBlockProps)} />,
    },
    HomeHeroBlock: {
      fields: {
        kicker: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'textarea' },
        primaryAction: { type: 'object', objectFields: { href: { type: 'text' }, label: { type: 'text' } } },
        secondaryAction: { type: 'object', objectFields: { href: { type: 'text' }, label: { type: 'text' } } },
        assistantAction: { type: 'object', objectFields: { href: { type: 'text' }, label: { type: 'text' } } },
        trustSignals: {
          type: 'array',
          defaultItemProps: { value: 'Trust signal' },
          arrayFields: { value: { type: 'text' } },
        },
        proofPoints: {
          type: 'array',
          defaultItemProps: { value: 'Private', label: 'Proof point' },
          arrayFields: { value: { type: 'text' }, label: { type: 'textarea' } },
        },
      },
      defaultProps: {
        kicker: 'Privacy-first student resilience',
        title: 'Aether',
        description:
          'A calm resilience ecosystem for students who need a private place to reflect, find direction, and return to support that feels steady.',
        primaryAction: { href: '/echo', label: 'Try Echo Chamber' },
        secondaryAction: { href: '/resilience-pathway', label: 'Open Resilience Hub' },
        assistantAction: { href: '/ask', label: 'Ask Aether' },
        trustSignals: [
          { value: 'Private by default' },
          { value: 'Peer-aware' },
          { value: 'Safety bounded' },
          { value: 'AI-readable' },
        ],
        proofPoints: [
          { value: 'Private', label: 'Reflection patterns are designed around minimized exposure.' },
          { value: 'Guided', label: 'The first action is always clearer than the surrounding stress.' },
          { value: 'Safe', label: 'Boundaries, crisis notes, and trust cues stay visible.' },
        ],
      },
      render: (data) => <HomeHeroBlock {...(data as unknown as HomeHeroBlockProps)} />,
    },
    HomeJourneyDockBlock: {
      fields: {
        items: {
          type: 'array',
          defaultItemProps: { title: 'Signal title', description: 'Signal description' },
          arrayFields: { title: { type: 'text' }, description: { type: 'textarea' } },
        },
      },
      defaultProps: {
        items: [
          { title: 'A calm first step', description: 'Aether starts with orientation, not pressure, so students can understand what support is available.' },
          { title: 'A reason to come back', description: 'Reflection, peer connection, and guided pathways create a rhythm that grows with each visit.' },
          { title: 'Trust in plain sight', description: 'Privacy, safety boundaries, and source-backed AI guidance stay visible across the experience.' },
        ],
      },
      render: (data) => <HomeJourneyDockBlock {...(data as unknown as HomeJourneyDockBlockProps)} />,
    },
    HomeStartOptionsBlock: {
      fields: {
        eyebrow: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'textarea' },
        items: {
          type: 'array',
          defaultItemProps: { title: 'Link card title', description: 'Link card description', href: '/' },
          arrayFields: { title: { type: 'text' }, description: { type: 'textarea' }, href: { type: 'text' } },
        },
      },
      defaultProps: {
        eyebrow: 'Start where you are',
        title: 'A first step should feel obvious.',
        description:
          'Aether keeps the first decision simple: get oriented, reflect privately, or understand the trust model before going deeper.',
        items: [
          { title: 'Open Resilience Hub', description: 'Begin with guided check-ins, planning, and practical support pathways.', href: '/resilience-pathway' },
          { title: 'Try Echo Chamber', description: 'Reflect privately with local voice capture and sentiment mapping.', href: '/echo' },
          { title: 'Start with Aether', description: 'Understand the trust model before going deeper.', href: '/about' },
        ],
      },
      render: (data) => <HomeStartOptionsBlock {...(data as unknown as HomeStartOptionsBlockProps)} />,
    },
    HomeFeatureGridBlock: {
      fields: {
        eyebrow: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'textarea' },
        items: {
          type: 'array',
          defaultItemProps: { title: 'Feature title', description: 'Feature description' },
          arrayFields: {
            eyebrow: { type: 'text' },
            title: { type: 'text' },
            description: { type: 'textarea' },
            href: { type: 'text' },
            hrefLabel: { type: 'text' },
          },
        },
      },
      defaultProps: {
        eyebrow: 'Why it feels worth returning to',
        title: 'Support that has a rhythm.',
        description:
          'The strongest wellbeing tools give people an immediate path, a safe sense of progress, and visible trust markers. Aether brings those patterns into a quieter interface system.',
        items: homeFeatureHighlights,
      },
      render: (data) => <HomeFeatureGridBlock {...(data as unknown as HomeFeatureGridBlockProps)} />,
    },
    HomeReturnLoopBlock: {
      fields: {
        exploreKicker: { type: 'text' },
        exploreTitle: { type: 'text' },
        exploreDescription: { type: 'textarea' },
        exploreItems: {
          type: 'array',
          defaultItemProps: { title: 'Section title', description: 'Section description', href: '/' },
          arrayFields: { title: { type: 'text' }, description: { type: 'textarea' }, href: { type: 'text' } },
        },
        retentionKicker: { type: 'text' },
        retentionTitle: { type: 'text' },
        retentionItems: {
          type: 'array',
          defaultItemProps: { title: 'Signal title', description: 'Signal description' },
          arrayFields: { title: { type: 'text' }, description: { type: 'textarea' } },
        },
      },
      defaultProps: {
        exploreKicker: 'Explore Aether',
        exploreTitle: 'Choose the path that matches the moment.',
        exploreDescription:
          'Privacy-first student resilience support with guided pathways, peer connection, and transparent AI. Navigation stays simple even when admins turn features on and off.',
        exploreItems: [
          { title: 'Resilience Hub', description: 'Guided check-ins, safety planning, resource routing, peer circles, and habits.', href: '/resilience-pathway' },
          { title: 'Echo Chamber', description: 'Private reflection with on-device transcript and sentiment mapping.', href: '/echo' },
          { title: 'Peer Navigator', description: 'Privacy-aware peer matching with explainable fairness controls.', href: '/peer-navigator' },
          { title: 'Aether Journal', description: 'Practical, evidence-informed student resilience guides.', href: '/blog' },
        ],
        retentionKicker: 'Retention loop',
        retentionTitle: 'Come back for clarity, not noise.',
        retentionItems: homeValueCards,
      },
      render: (data) => <HomeReturnLoopBlock {...(data as unknown as HomeReturnLoopBlockProps)} />,
    },
    HomeFaqBlock: {
      fields: {
        kicker: { type: 'text' },
        title: { type: 'text' },
        items: {
          type: 'array',
          defaultItemProps: { question: 'Question', answer: 'Answer' },
          arrayFields: { question: { type: 'text' }, answer: { type: 'textarea' } },
        },
      },
      defaultProps: {
        kicker: 'Quick answers',
        title: 'Frequently asked questions',
        items: homeFaqs,
      },
      render: (data) => <HomeFaqBlock {...(data as unknown as HomeFaqBlockProps)} />,
    },
    GlobalHeaderBlock: {
      fields: {
        bannerText: { type: 'textarea' },
        bannerVariant: {
          type: 'select',
          options: [
            { label: 'Emerald', value: 'emerald' },
            { label: 'Sky', value: 'sky' },
            { label: 'Slate', value: 'slate' },
            { label: 'Amber', value: 'amber' },
          ],
        },
        surfaceVariant: {
          type: 'select',
          options: [
            { label: 'Glass', value: 'glass' },
            { label: 'Solid', value: 'solid' },
            { label: 'Calm', value: 'calm' },
          ],
        },
        trustBarVariant: {
          type: 'select',
          options: [
            { label: 'Mint', value: 'mint' },
            { label: 'Slate', value: 'slate' },
            { label: 'Sky', value: 'sky' },
          ],
        },
        siteName: { type: 'text' },
        tagline: { type: 'text' },
        logoHref: { type: 'text' },
        logoAlt: { type: 'text' },
        ctaLabel: { type: 'text' },
        ctaHref: { type: 'text' },
        ctaDescription: { type: 'text' },
        feedbackLabel: { type: 'text' },
        explorePrimaryTitle: { type: 'text' },
        explorePrimaryDescription: { type: 'textarea' },
        exploreSecondaryTitle: { type: 'text' },
        exploreSecondaryDescription: { type: 'textarea' },
        mobilePrimaryDescription: { type: 'textarea' },
        mobileSecondaryDescription: { type: 'textarea' },
        trustSignals: {
          type: 'array',
          defaultItemProps: { value: 'Trust signal' },
          arrayFields: { value: { type: 'text' } },
        },
        primaryNavigation: {
          type: 'array',
          defaultItemProps: { label: 'Navigation label', href: '/' },
          arrayFields: {
            label: { type: 'text' },
            href: { type: 'text' },
            description: { type: 'textarea' },
            external: {
              type: 'select',
              options: [
                { label: 'Internal', value: 'false' },
                { label: 'External', value: 'true' },
              ],
            },
          },
        },
        secondaryNavigation: {
          type: 'array',
          defaultItemProps: { label: 'Navigation label', href: '/' },
          arrayFields: {
            label: { type: 'text' },
            href: { type: 'text' },
            description: { type: 'textarea' },
            external: {
              type: 'select',
              options: [
                { label: 'Internal', value: 'false' },
                { label: 'External', value: 'true' },
              ],
            },
          },
        },
      },
      defaultProps: {
        bannerText: '',
        bannerVariant: 'emerald',
        surfaceVariant: 'glass',
        trustBarVariant: 'mint',
        siteName: 'Aether',
        tagline: 'Privacy-first student resilience support with guided pathways, peer connection, and transparent AI.',
        logoHref: '/aether-logo-icon.svg',
        logoAlt: 'Aether logo',
        ctaLabel: 'Ask Aether',
        ctaHref: '/ask',
        ctaDescription: 'Open the guided copilot workspace.',
        feedbackLabel: 'Share feedback',
        explorePrimaryTitle: 'Build resilience',
        explorePrimaryDescription: 'Core product experiences for reflection, guidance, support, and learning.',
        exploreSecondaryTitle: 'Trust and context',
        exploreSecondaryDescription: 'Understand the principles, people, and safeguards behind Aether.',
        mobilePrimaryDescription: 'Start with the most useful product surfaces.',
        mobileSecondaryDescription: 'Review privacy, accessibility, mentors, and governance.',
        trustSignals: [
          { value: 'Privacy-first' },
          { value: 'Peer support' },
          { value: 'Safety-aware' },
          { value: 'AI-readable' },
        ],
        primaryNavigation: [
          {
            label: 'Resilience Hub',
            href: '/resilience-pathway',
            description: 'Guided check-ins, safety planning, resource routing, peer circles, and habits.',
            external: 'false',
          },
          {
            label: 'Echo',
            href: '/echo',
            description: 'Private reflection with on-device transcript and sentiment mapping.',
            external: 'false',
          },
          {
            label: 'Peer Navigator',
            href: '/peer-navigator',
            description: 'Privacy-aware peer matching with explainable fairness controls.',
            external: 'false',
          },
          {
            label: 'Journal',
            href: '/blog',
            description: 'Practical, evidence-informed student resilience guides.',
            external: 'false',
          },
        ],
        secondaryNavigation: [
          {
            label: 'Governance',
            href: '/fairness-governance',
            description: 'Fairness metrics, policy posture, and auditability.',
            external: 'false',
          },
          {
            label: 'Privacy',
            href: '/privacy',
            description: 'Local-first design, minimized data exposure, and identity safety.',
            external: 'false',
          },
          {
            label: 'Accessibility',
            href: '/accessibility',
            description: 'Inclusive design commitments and SAFE-AI guidance.',
            external: 'false',
          },
          {
            label: 'About',
            href: '/about',
            description: 'Mission, architecture, and product context.',
            external: 'false',
          },
          {
            label: 'Mentors',
            href: '/mentors',
            description: 'Public gratitude for the guidance behind Aether.',
            external: 'false',
          },
          {
            label: 'Feedback',
            href: '/feedback',
            description: 'Report an issue, request a fix, or suggest what Aether should add next.',
            external: 'false',
          },
        ],
      },
      render: (data) => <GlobalHeaderBlock {...(data as unknown as GlobalHeaderBlockProps)} />,
    },
    GlobalFooterBlock: {
      fields: {
        surfaceVariant: {
          type: 'select',
          options: [
            { label: 'Glass', value: 'glass' },
            { label: 'White', value: 'white' },
            { label: 'Mint', value: 'mint' },
          ],
        },
        accentVariant: {
          type: 'select',
          options: [
            { label: 'Teal', value: 'teal' },
            { label: 'Slate', value: 'slate' },
            { label: 'Indigo', value: 'indigo' },
          ],
        },
        summaryText: { type: 'textarea' },
        safetyTitle: { type: 'text' },
        safetyNote: { type: 'textarea' },
        copyrightText: { type: 'text' },
        socialSharePath: { type: 'text' },
        socialShareTitle: { type: 'text' },
        badgeHref: { type: 'text' },
        badgeAriaLabel: { type: 'text' },
        dedicationLabel: { type: 'text' },
        dedicationHref: { type: 'text' },
        attributionPrefix: { type: 'text' },
        authorName: { type: 'text' },
        authorUrl: { type: 'text' },
        authorLinkLabel: { type: 'text' },
        trustSignals: {
          type: 'array',
          defaultItemProps: { value: 'Trust signal' },
          arrayFields: { value: { type: 'text' } },
        },
        navigationLinks: {
          type: 'array',
          defaultItemProps: { groupTitle: 'Group', label: 'Footer link', href: '/' },
          arrayFields: {
            groupTitle: { type: 'text' },
            label: { type: 'text' },
            href: { type: 'text' },
            description: { type: 'textarea' },
            external: {
              type: 'select',
              options: [
                { label: 'Internal', value: 'false' },
                { label: 'External', value: 'true' },
              ],
            },
          },
        },
      },
      defaultProps: {
        surfaceVariant: 'glass',
        accentVariant: 'teal',
        summaryText:
          'Aether is a student resilience ecosystem designed to support reflection, navigation, and safer next steps.',
        safetyTitle: 'Safety Note',
        safetyNote:
          'Aether is a support and resilience experience, not emergency care. If there is imminent danger, contact local emergency services. In the United States, call or text 988.',
        copyrightText: 'Research-driven. Privacy-first.',
        socialSharePath: '/',
        socialShareTitle: 'Aether: Student Resiliency Ecosystem',
        badgeHref: 'https://saugus.pioneercss.org',
        badgeAriaLabel: 'Visit PCSS II Saugus',
        dedicationLabel: 'Dedicated to PCSS II Students and Staff.',
        dedicationHref: 'https://saugus.pioneercss.org',
        attributionPrefix: 'Aether logo artwork (c)',
        authorName: 'Aarti S Ravikumar',
        authorUrl: 'https://aartisr.foreverlotus.com',
        authorLinkLabel: 'Aarti S Ravikumar',
        trustSignals: [
          { value: 'Privacy-first' },
          { value: 'Peer support' },
          { value: 'Safety-aware' },
          { value: 'AI-readable' },
        ],
        navigationLinks: [
          { groupTitle: 'Product', label: 'Resilience Hub', href: '/resilience-pathway', external: 'false' },
          { groupTitle: 'Product', label: 'Echo Chamber', href: '/echo', external: 'false' },
          { groupTitle: 'Product', label: 'Peer Navigator', href: '/peer-navigator', external: 'false' },
          { groupTitle: 'Product', label: 'Aether Journal', href: '/blog', external: 'false' },
          { groupTitle: 'Trust', label: 'Privacy', href: '/privacy', external: 'false' },
          { groupTitle: 'Trust', label: 'Accessibility', href: '/accessibility', external: 'false' },
          { groupTitle: 'Trust', label: 'Fairness Governance', href: '/fairness-governance', external: 'false' },
          { groupTitle: 'Trust', label: '988 Lifeline', href: 'https://988lifeline.org/', external: 'true' },
          { groupTitle: 'About', label: 'About Aether', href: '/about', external: 'false' },
          { groupTitle: 'About', label: 'Mentors', href: '/mentors', external: 'false' },
          { groupTitle: 'About', label: 'Feedback', href: '/feedback', external: 'false' },
          { groupTitle: 'About', label: 'RSS Feed', href: '/feed.xml', external: 'false' },
          { groupTitle: 'About', label: 'AI Guide', href: '/llms.txt', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Sitemap', href: '/sitemap.xml', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Image Sitemap', href: '/image-sitemap.xml', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Robots', href: '/robots.txt', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Web Manifest', href: '/manifest.webmanifest', external: 'false' },
        ],
      },
      render: (data) => <GlobalFooterBlock {...(data as unknown as GlobalFooterBlockProps)} />,
    },
    NoticeBlock: {
      fields: {
        kicker: { type: 'text' },
        title: { type: 'text' },
        description: { type: 'textarea' },
        link: { type: 'object', objectFields: { href: { type: 'text' }, label: { type: 'text' } } },
      },
      defaultProps: { title: 'Important Note', description: 'Add supporting guidance.' },
      render: (data) => <NoticeBlock {...(data as unknown as NoticeBlockProps)} />,
    },
  },
};

function toBadgeItems(items: string[]) {
  return items.map((value) => ({ value }));
}

function createGlobalShellDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('GlobalHeaderBlock', {
        bannerText: '',
        bannerVariant: 'emerald',
        surfaceVariant: 'glass',
        trustBarVariant: 'mint',
        siteName: 'Aether',
        tagline: 'Privacy-first student resilience support with guided pathways, peer connection, and transparent AI.',
        logoHref: '/aether-logo-icon.svg',
        logoAlt: 'Aether logo',
        ctaLabel: 'Ask Aether',
        ctaHref: '/ask',
        ctaDescription: 'Open the guided copilot workspace.',
        feedbackLabel: 'Share feedback',
        explorePrimaryTitle: 'Build resilience',
        explorePrimaryDescription: 'Core product experiences for reflection, guidance, support, and learning.',
        exploreSecondaryTitle: 'Trust and context',
        exploreSecondaryDescription: 'Understand the principles, people, and safeguards behind Aether.',
        mobilePrimaryDescription: 'Start with the most useful product surfaces.',
        mobileSecondaryDescription: 'Review privacy, accessibility, mentors, and governance.',
        trustSignals: [
          { value: 'Privacy-first' },
          { value: 'Peer support' },
          { value: 'Safety-aware' },
          { value: 'AI-readable' },
        ],
        primaryNavigation: [
          {
            label: 'Resilience Hub',
            href: '/resilience-pathway',
            description: 'Guided check-ins, safety planning, resource routing, peer circles, and habits.',
            external: 'false',
          },
          {
            label: 'Echo',
            href: '/echo',
            description: 'Private reflection with on-device transcript and sentiment mapping.',
            external: 'false',
          },
          {
            label: 'Peer Navigator',
            href: '/peer-navigator',
            description: 'Privacy-aware peer matching with explainable fairness controls.',
            external: 'false',
          },
          {
            label: 'Journal',
            href: '/blog',
            description: 'Practical, evidence-informed student resilience guides.',
            external: 'false',
          },
        ],
        secondaryNavigation: [
          {
            label: 'Governance',
            href: '/fairness-governance',
            description: 'Fairness metrics, policy posture, and auditability.',
            external: 'false',
          },
          {
            label: 'Privacy',
            href: '/privacy',
            description: 'Local-first design, minimized data exposure, and identity safety.',
            external: 'false',
          },
          {
            label: 'Accessibility',
            href: '/accessibility',
            description: 'Inclusive design commitments and SAFE-AI guidance.',
            external: 'false',
          },
          {
            label: 'About',
            href: '/about',
            description: 'Mission, architecture, and product context.',
            external: 'false',
          },
          {
            label: 'Mentors',
            href: '/mentors',
            description: 'Public gratitude for the guidance behind Aether.',
            external: 'false',
          },
          {
            label: 'Feedback',
            href: '/feedback',
            description: 'Report an issue, request a fix, or suggest what Aether should add next.',
            external: 'false',
          },
        ],
      }),
      withBlock('GlobalFooterBlock', {
        surfaceVariant: 'glass',
        accentVariant: 'teal',
        summaryText:
          'Aether is a student resilience ecosystem designed to support reflection, navigation, and safer next steps.',
        safetyTitle: 'Safety Note',
        safetyNote:
          'Aether is a support and resilience experience, not emergency care. If there is imminent danger, contact local emergency services. In the United States, call or text 988.',
        copyrightText: 'Research-driven. Privacy-first.',
        socialSharePath: '/',
        socialShareTitle: 'Aether: Student Resiliency Ecosystem',
        badgeHref: 'https://saugus.pioneercss.org',
        badgeAriaLabel: 'Visit PCSS II Saugus',
        dedicationLabel: 'Dedicated to PCSS II Students and Staff.',
        dedicationHref: 'https://saugus.pioneercss.org',
        attributionPrefix: 'Aether logo artwork (c)',
        authorName: 'Aarti S Ravikumar',
        authorUrl: 'https://aartisr.foreverlotus.com',
        authorLinkLabel: 'Aarti S Ravikumar',
        trustSignals: [
          { value: 'Privacy-first' },
          { value: 'Peer support' },
          { value: 'Safety-aware' },
          { value: 'AI-readable' },
        ],
        navigationLinks: [
          { groupTitle: 'Product', label: 'Resilience Hub', href: '/resilience-pathway', external: 'false' },
          { groupTitle: 'Product', label: 'Echo Chamber', href: '/echo', external: 'false' },
          { groupTitle: 'Product', label: 'Peer Navigator', href: '/peer-navigator', external: 'false' },
          { groupTitle: 'Product', label: 'Aether Journal', href: '/blog', external: 'false' },
          { groupTitle: 'Trust', label: 'Privacy', href: '/privacy', external: 'false' },
          { groupTitle: 'Trust', label: 'Accessibility', href: '/accessibility', external: 'false' },
          { groupTitle: 'Trust', label: 'Fairness Governance', href: '/fairness-governance', external: 'false' },
          { groupTitle: 'Trust', label: '988 Lifeline', href: 'https://988lifeline.org/', external: 'true' },
          { groupTitle: 'About', label: 'About Aether', href: '/about', external: 'false' },
          { groupTitle: 'About', label: 'Mentors', href: '/mentors', external: 'false' },
          { groupTitle: 'About', label: 'Feedback', href: '/feedback', external: 'false' },
          { groupTitle: 'About', label: 'RSS Feed', href: '/feed.xml', external: 'false' },
          { groupTitle: 'About', label: 'AI Guide', href: '/llms.txt', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Sitemap', href: '/sitemap.xml', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Image Sitemap', href: '/image-sitemap.xml', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Robots', href: '/robots.txt', external: 'false' },
          { groupTitle: 'Machine-Readable', label: 'Web Manifest', href: '/manifest.webmanifest', external: 'false' },
        ],
      }),
    ],
  });
}

function createInfoPageDefaults(page: CmsPageDefinition, config: InfoLikeConfig): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', { kicker: config.kicker, title: config.title, description: config.description }),
      withBlock('ActionBlock', { primaryAction: config.primaryAction, secondaryAction: config.secondaryAction }),
      ...(config.metrics?.length ? [withBlock('MetricsBlock', { title: 'Highlights', items: config.metrics })] : []),
      withBlock('CardGridBlock', {
        eyebrow: config.itemSection?.eyebrow,
        title: config.itemSection?.title ?? 'Key areas',
        description: config.itemSection?.description,
        columns: config.itemSection?.columns ?? 'two',
        items: config.items,
      }),
      ...(config.sections ?? []).map((section) =>
        withBlock('CardGridBlock', {
          eyebrow: section.eyebrow,
          title: section.title,
          description: section.description,
          columns: section.columns ?? 'two',
          items: section.items,
        }),
      ),
      ...(config.footerNote ? [withBlock('NoticeBlock', { kicker: 'Continue with context', title: 'Next step', description: config.footerNote, link: config.footerLink })] : []),
    ],
  });
}

function createHomeDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HomeHeroBlock', {
        kicker: 'Privacy-first student resilience',
        title: 'Aether',
        description:
          'A calm resilience ecosystem for students who need a private place to reflect, find direction, and return to support that feels steady.',
        primaryAction: { href: '/echo', label: 'Try Echo Chamber' },
        secondaryAction: { href: '/resilience-pathway', label: 'Open Resilience Hub' },
        assistantAction: { href: '/ask', label: 'Ask Aether' },
        trustSignals: toBadgeItems(['Private by default', 'Peer-aware', 'Safety bounded', 'AI-readable']),
        proofPoints: [
          { value: 'Private', label: 'Reflection patterns are designed around minimized exposure.' },
          { value: 'Guided', label: 'The first action is always clearer than the surrounding stress.' },
          { value: 'Safe', label: 'Boundaries, crisis notes, and trust cues stay visible.' },
        ],
      }),
      withBlock('HomeJourneyDockBlock', {
        items: [
          {
            title: 'A calm first step',
            description: 'Aether starts with orientation, not pressure, so students can understand what support is available.',
          },
          {
            title: 'A reason to come back',
            description: 'Reflection, peer connection, and guided pathways create a rhythm that grows with each visit.',
          },
          {
            title: 'Trust in plain sight',
            description: 'Privacy, safety boundaries, and source-backed AI guidance stay visible across the experience.',
          },
        ],
      }),
      withBlock('HomeStartOptionsBlock', {
        eyebrow: 'Start where you are',
        title: 'A first step should feel obvious.',
        description:
          'Aether keeps the first decision simple: get oriented, reflect privately, or understand the trust model before going deeper.',
        items: homeStartOptions.map((option) => ({ title: option.title, description: option.description, href: option.href })),
      }),
      withBlock('HomeFeatureGridBlock', {
        eyebrow: 'Why it feels worth returning to',
        title: 'Support that has a rhythm.',
        description:
          'The strongest wellbeing tools give people an immediate path, a safe sense of progress, and visible trust markers. Aether brings those patterns into a quieter interface system.',
        items: homeFeatureHighlights,
      }),
      withBlock('HomeReturnLoopBlock', {
        exploreKicker: 'Explore Aether',
        exploreTitle: 'Choose the path that matches the moment.',
        exploreDescription:
          'Privacy-first student resilience support with guided pathways, peer connection, and transparent AI. Navigation stays simple even when admins turn features on and off.',
        exploreItems: [
          { title: 'Resilience Hub', description: 'Guided check-ins, safety planning, resource routing, peer circles, and habits.', href: '/resilience-pathway' },
          { title: 'Echo Chamber', description: 'Private reflection with on-device transcript and sentiment mapping.', href: '/echo' },
          { title: 'Peer Navigator', description: 'Privacy-aware peer matching with explainable fairness controls.', href: '/peer-navigator' },
          { title: 'Aether Journal', description: 'Practical, evidence-informed student resilience guides.', href: '/blog' },
          { title: 'Feedback', description: 'Report an issue, request a fix, or suggest what Aether should add next.', href: '/feedback' },
        ],
        retentionKicker: 'Retention loop',
        retentionTitle: 'Come back for clarity, not noise.',
        retentionItems: homeValueCards,
      }),
      withBlock('HomeFaqBlock', { kicker: 'Quick answers', title: 'Frequently asked questions', items: homeFaqs }),
    ],
  });
}

function createAskDefaults(page: CmsPageDefinition): Data {
  const askStarters = [
    'Where should I start if I feel overwhelmed?',
    'Compare privacy, Echo, and the Resilience Hub.',
    'What sources support Peer Navigator?',
    'Explain Aether in simple words.',
  ];
  const retrievalModes = [
    { title: 'Grounded', description: 'Answers come from indexed Aether content and source cards.' },
    { title: 'Flexible', description: 'The assistant works across enabled pages and knowledge-base documents.' },
    { title: 'Bounded', description: 'Safety, crisis, and privacy boundaries override normal guidance.' },
  ];

  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Grounded resilience copilot',
        title: 'Ask Aether',
        description: 'Ask across the Aether product, journal, and design knowledge base. The assistant retrieves approved content and turns answers into safe next steps.',
      }),
      withBlock('AskAssistantBlock', {
        kicker: 'Interactive assistant',
        title: 'Ask Aether assistant',
        description: 'Use natural language prompts to explore Aether routes and knowledge.',
        starterPrompts: askStarters,
      }),
      withBlock('CardGridBlock', { eyebrow: 'Retrieval behavior', title: 'How responses are generated', columns: 'three', items: retrievalModes }),
      withBlock('NoticeBlock', {
        kicker: 'Safety boundary',
        title: 'Not crisis care',
        description:
          'This assistant is informational. It is not emergency support, therapy, diagnosis, legal advice, or crisis care. In the United States, call or text 988 for urgent mental health crisis support.',
        link: { href: 'https://988lifeline.org/', label: 'Visit 988 Lifeline' },
      }),
    ],
  });
}

function createEchoDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Private Reflection',
        title: 'Echo Chamber',
        description: 'An anonymized, voice-enabled outlet for catharsis with on-device transcript, sentiment, and safety signal mapping.',
      }),
      withBlock('EchoStudioBlock', {
        kicker: 'Interactive module',
        title: 'Echo reflection studio',
        description: 'Voice recording and local analysis are embedded below. Edit this text to guide students through the flow.',
      }),
      withBlock('NoticeBlock', { kicker: 'Privacy', description: 'Audio, transcript, and classifications remain on-device in this implementation.' }),
    ],
  });
}

function createMentorsDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Mentor Appreciation',
        title: 'The Mentors Behind Aether',
        description: 'This project exists because mentors gave precision, challenge, and care at every critical turning point.',
      }),
      withBlock('MarkdownBlock', {
        eyebrow: 'A Public Thank You',
        title: 'Mentorship as core infrastructure',
        body: 'Aether was shaped in rooms where mentors asked harder questions than we expected and offered steadier support than we deserved. They challenged assumptions, redirected weak decisions, and helped us build a system that protects students while remaining practical to implement.\n\nThis page is a standing acknowledgment that mentorship is core infrastructure, as important to project quality as code, design, and research.',
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Featured gratitude',
        title: 'Featured Mentor Gratitude',
        columns: 'two',
        items: featuredMentors.map((mentor) => ({ eyebrow: mentor.title, title: mentor.name, description: mentor.gratitude })),
      }),
      withBlock('MetricsBlock', { title: 'Mentor Impact', items: mentorImpactStats.map((item) => ({ value: item.value, label: item.label, description: item.note })) }),
      withBlock('CardGridBlock', { title: 'How Mentors Changed the Build', columns: 'two', items: mentorContributionPillars }),
      withBlock('MarkdownBlock', {
        title: 'Mentor Constellation',
        body: 'Mentorship influence appears in clusters. Guidance, encouragement, rigor, and integrity connect across every release.',
      }),
      withBlock('CardGridBlock', {
        title: 'Mentor Constellation Nodes',
        columns: 'four',
        items: mentorConstellationNodes.map((node) => ({ eyebrow: 'Node', title: node.label, description: node.note })),
      }),
      withBlock('CardGridBlock', { title: 'Recognition Rituals We Commit To', columns: 'two', items: mentorRecognitionRituals }),
      withBlock('FaqBlock', { title: 'Mentor Recognition FAQ', items: mentorFAQs }),
    ],
  });
}

function createPeerNavigatorDefaults(page: CmsPageDefinition): Data {
  const matchingSteps = [
    { title: 'Signal', description: 'Choose one broad context area. The demo avoids names, contact details, and sensitive free text.' },
    { title: 'Rank', description: 'The matcher scores fit through staged compatibility, safety, and fairness-aware adjustments.' },
    { title: 'Review', description: 'A primary and backup match are shown with score progression for auditability.' },
  ];

  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Belonging Support',
        title: 'Peer-Navigator Network',
        description: 'Connect with peers who share relevant lived context and build support pathways in a privacy-aware matching flow.',
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Matching workspace',
        title: 'Find a relevant peer pathway',
        description: 'Choose a broad context, then review how the system arrives at a primary and backup match. This demo is transparent by design.',
        columns: 'three',
        items: matchingSteps,
      }),
      withBlock('NoticeBlock', { kicker: 'Transparency', description: 'This is a demo with advanced metrics. In production, matching is privacy-preserving and peer-verified.' }),
    ],
  });
}

function createResilienceDefaults(page: CmsPageDefinition): Data {
  const operatingMetrics = [
    { value: '5', label: 'support modes', description: 'check-in, safety, resources, peers, habits' },
    { value: '24/7', label: 'urgent lane', description: 'crisis support is never hidden behind product UI' },
    { value: '0', label: 'required account', description: 'the core hub can orient a student immediately' },
    { value: String(researchReferences.length), label: 'research inputs', description: 'public-health, campus, peer, and product benchmarks' },
  ];

  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Student resilience command hub',
        title: 'Aether Resilience Hub',
        description:
          'A warm, privacy-first operating system for student support: fast enough for the moment of need, careful enough for safety, and structured enough for campus teams to improve services.',
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Live care map',
        title: 'Live care map',
        description: 'Stabilize, navigate, belong, and practice lanes provide clear next-step pathways for students.',
        columns: 'four',
        items: hubSupportLanes,
      }),
      withBlock('ActionBlock', { primaryAction: { href: '#check-in', label: 'Start check-in' }, secondaryAction: { href: '#safety-plan', label: 'Build safety plan' } }),
      withBlock('ActionBlock', { primaryAction: { href: 'https://988lifeline.org/', label: 'Get 24/7 crisis support' } }),
      withBlock('MetricsBlock', { title: 'Operating metrics', items: operatingMetrics }),
      withBlock('MarkdownBlock', {
        eyebrow: 'Intervention architecture',
        title: 'From first signal to sustained recovery',
        body: 'The pathway is intentionally modular: each step can stand alone, but together they create a humane progression from noticing strain to building daily resilience.',
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Intervention architecture',
        title: 'Pathway stages',
        columns: 'three',
        items: resiliencePathwayStages.map((stage, index) => ({ eyebrow: `Step ${index + 1}`, title: stage.title, description: stage.description })),
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Benchmark synthesis',
        title: 'What world-class wellbeing products get right',
        columns: 'four',
        items: hubBenchmarkInsights.map((item) => ({ eyebrow: item.source, title: item.title, description: item.insight })),
      }),
      withBlock('ResilienceToolkitBlock', {
        kicker: 'Interactive tools',
        title: 'Resilience toolkit modules',
        description: 'Check-in, safety planning, navigation, peer matching, and habit planning are editable and runnable here.',
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Research and evidence',
        title: `Research and Benchmark Inputs (${researchReferences.length})`,
        description: 'References that informed feature selection, safety pathways, and resilience intervention patterns.',
        columns: 'two',
        items: researchReferences.map((reference) => ({
          eyebrow: reference.category,
          title: reference.name,
          description: reference.evidenceSignal,
          href: reference.url,
          hrefLabel: 'Visit source',
        })),
      }),
    ],
  });
}

function createBlogIndexDefaults(page: CmsPageDefinition): Data {
  const featuredGuide = [
    {
      eyebrow: 'Start here',
      title: 'Stabilize your baseline',
      description: 'Start with the latest practical guide to establish steadiness before layering additional changes.',
      href: '/blog/practical-path-01-stabilize-your-baseline',
      hrefLabel: 'Start latest guide',
    },
  ];

  const readingPathSteps = [
    { eyebrow: 'Step 1', title: 'Pick one guide', description: 'Start with one practical path instead of consuming everything at once.' },
    { eyebrow: 'Step 2', title: 'Try one action for seven days', description: 'Keep the action small and repeatable so the habit can stick.' },
    { eyebrow: 'Step 3', title: 'Return with a sharper question', description: 'Use Ask Aether or another route once you have real signal from practice.' },
  ];

  const connectRoutes = [
    {
      title: 'Resilience Pathway',
      description: 'Open check-ins, safety planning, navigation, and support modules directly from journal insights.',
      href: '/resilience-pathway',
      hrefLabel: 'Open Resilience Pathway',
    },
    {
      title: 'Echo Chamber',
      description: 'Process emotion privately before deciding on the next support action.',
      href: '/echo',
      hrefLabel: 'Open Echo Chamber',
    },
    {
      title: 'Peer-Navigator',
      description: 'Translate reflection into belonging support through transparent peer matching.',
      href: '/peer-navigator',
      hrefLabel: 'Open Peer-Navigator',
    },
    {
      title: 'Fairness & Governance',
      description: 'Inspect policy and audit context behind peer-matching behavior.',
      href: '/fairness-governance',
      hrefLabel: 'View governance',
    },
    {
      title: 'Ask Aether',
      description: 'Ask source-grounded questions across journal content and product pathways.',
      href: '/ask',
      hrefLabel: 'Ask a question',
    },
  ];

  const recentGuides = [
    {
      eyebrow: 'Recent guides',
      title: 'Keep the thread going',
      description: 'Use latest posts to maintain momentum after your first practical path.',
    },
    {
      title: 'Stabilize your baseline',
      description: 'Rebuild daily steadiness before layering on new goals and commitments.',
      href: '/blog/practical-path-01-stabilize-your-baseline',
      hrefLabel: 'Read guide',
    },
    {
      title: 'Build your support map',
      description: 'Identify people, places, and routines you can activate when pressure spikes.',
      href: '/blog/practical-path-02-build-your-support-map',
      hrefLabel: 'Read guide',
    },
    {
      title: 'Study stress operating system',
      description: 'Turn heavy academic load into repeatable focus and recovery loops.',
      href: '/blog/practical-path-03-study-stress-operating-system',
      hrefLabel: 'Read guide',
    },
  ];

  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Aether Journal',
        title: 'Practical Resilience Library',
        description: 'Short, evidence-informed guides for students who need calm next steps, not a wall of advice.',
      }),
      withBlock('ActionBlock', { primaryAction: { href: '/feed.xml', label: 'Subscribe via RSS' }, secondaryAction: { href: '/ask', label: 'Ask Aether' } }),
      withBlock('CardGridBlock', {
        eyebrow: 'Start here',
        title: 'Latest guide',
        description: 'Begin with a single practical path before exploring the rest of the library.',
        columns: 'two',
        items: featuredGuide,
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Reading path',
        title: 'Build a weekly rhythm',
        description: 'Stabilize, map support, manage stress, recover from setbacks, and plan the next season.',
        columns: 'three',
        items: readingPathSteps,
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Connect reading to action',
        title: 'Move from insight to support',
        description: 'Pair each article with a practical tool, reflection space, or source-grounded question.',
        columns: 'three',
        items: connectRoutes,
      }),
      withBlock('CardGridBlock', {
        eyebrow: 'Recent guides',
        title: 'Keep the thread going',
        description: 'Continue with the latest practical paths and reinforce continuity week to week.',
        columns: 'two',
        items: recentGuides,
      }),
      withBlock('NoticeBlock', {
        kicker: 'Full library',
        title: 'Every practical path',
        description: 'Tags, dates, and reading times are generated from markdown post metadata and updated automatically.',
      }),
      withBlock('NoticeBlock', {
        kicker: 'Content source',
        title: 'Blog posts are markdown-driven',
        description:
          'Featured cards, recent guides, tags, dates, and reading times come from files in content/blog. Use this CMS page to edit surrounding framing and connective narrative.',
      }),
    ],
  });
}

function createBlogTemplateDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Blog post template',
        title: 'Blog article experience',
        description: 'This template controls shared framing around each markdown article, including discussion guidance and FAQ positioning.',
      }),
      withBlock('NoticeBlock', {
        kicker: 'Markdown-first',
        description: 'Article body text still comes from markdown files. Use this CMS template to edit reusable layout copy and helper messaging around posts.',
      }),
    ],
  });
}

function createFeedbackDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Feedback Observatory',
        title: 'Help improve Aether',
        description: 'Report issues, request fixes, and suggest useful additions through a structured, privacy-aware intake flow.',
      }),
      withBlock('FeedbackFormBlock', {
        kicker: 'Interactive form',
        title: 'Feedback Observatory',
        description: 'Help improve a page, report an issue, or suggest what Aether should support next. The form turns rough thoughts into clear product signals.',
        productName: 'Aether',
      }),
    ],
  });
}

function createFairnessDefaults(page: CmsPageDefinition): Data {
  return ensureContentIds({
    root: { props: { title: page.name } },
    content: [
      withBlock('HeroBlock', {
        kicker: 'Policy and transparency',
        title: 'Fairness & Governance',
        description: 'Review fairness metrics, audit trails, and governance policy framing for the peer matching system.',
      }),
      withBlock('FairnessDashboardBlock', {
        kicker: 'Interactive dashboard',
        title: 'Fairness audit dashboard',
        description: 'Inspect cohort metrics, policy parameters, and audit trail behavior in this embedded module.',
      }),
    ],
  });
}

function isLegacySingleBlockData(data: Data): boolean {
  const content = Array.isArray(data.content) ? data.content : [];
  return content.length === 1 && content[0]?.type === 'AetherPageBlock';
}

export function migrateCmsDataIfNeeded(page: CmsPageDefinition, data: Data): Data {
  if (!isLegacySingleBlockData(data)) return ensureContentIds(data);
  return createDefaultCmsPageData(page);
}

export function createDefaultCmsPageData(page: CmsPageDefinition): Data {
  switch (page.id) {
    case 'global-shell':
      return createGlobalShellDefaults(page);
    case 'home':
      return createHomeDefaults(page);
    case 'about':
      return createInfoPageDefaults(page, aboutCmsSeed);
    case 'accessibility':
      return createInfoPageDefaults(page, accessibilityCmsSeed);
    case 'privacy':
      return createInfoPageDefaults(page, privacyCmsSeed);
    case 'ask':
      return createAskDefaults(page);
    case 'echo':
      return createEchoDefaults(page);
    case 'mentors':
      return createMentorsDefaults(page);
    case 'peer-navigator':
      return createPeerNavigatorDefaults(page);
    case 'resilience-pathway':
      return createResilienceDefaults(page);
    case 'blog':
      return createBlogIndexDefaults(page);
    case 'blog-post':
      return createBlogTemplateDefaults(page);
    case 'feedback':
      return createFeedbackDefaults(page);
    case 'fairness-governance':
      return createFairnessDefaults(page);
    default:
      return ensureContentIds({
        root: { props: { title: page.name } },
        content: [
          withBlock('HeroBlock', { kicker: page.name, title: page.name, description: page.description }),
          withBlock('MarkdownBlock', { body: `Edit the ${page.name.toLowerCase()} page in Puck.\n\nPath: ${page.path}` }),
        ],
      });
  }
}
