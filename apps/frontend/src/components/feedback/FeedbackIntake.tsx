'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { track } from '../../lib/analytics';

type FeedbackType =
  | 'bug'
  | 'content'
  | 'design'
  | 'accessibility'
  | 'privacy'
  | 'performance'
  | 'feature';

type ImpactLevel = 'tiny' | 'noticeable' | 'blocking' | 'trust';

export type FeedbackSubmission = {
  surface: string;
  type: FeedbackType;
  issue: string;
  requestedFix: string;
  wantsAddition: boolean;
  addition: string;
  audience: string;
  importance: string;
  impact: ImpactLevel;
  deviceContext: string;
  contact: string;
  allowFollowUp: boolean;
  submittedAt: string;
};

type FeedbackSubmitResult = {
  id: string;
  status: string;
  createdAt: string;
  reviewPath?: string;
};

export type FeedbackIntakeProps = {
  productName?: string;
  title?: string;
  description?: string;
  defaultSurface?: string;
  storageKey?: string;
  onSubmit?: (submission: FeedbackSubmission) => FeedbackSubmitResult | void | Promise<FeedbackSubmitResult | void>;
};

const feedbackTypes: Array<{ id: FeedbackType; label: string; description: string }> = [
  { id: 'bug', label: 'Bug', description: 'Something broke or behaves incorrectly.' },
  { id: 'content', label: 'Content', description: 'Copy is unclear, outdated, missing, or inaccurate.' },
  { id: 'design', label: 'Design', description: 'Layout, hierarchy, or interaction needs refinement.' },
  { id: 'accessibility', label: 'Accessibility', description: 'Keyboard, screen reader, contrast, motion, or readability issue.' },
  { id: 'privacy', label: 'Safety/privacy', description: 'A trust, consent, privacy, or safety concern.' },
  { id: 'performance', label: 'Performance', description: 'The page feels slow, heavy, unstable, or jumpy.' },
  { id: 'feature', label: 'Feature request', description: 'A new capability or extension would help.' },
];

const impactOptions: Array<{ id: ImpactLevel; label: string; weight: number }> = [
  { id: 'tiny', label: 'Tiny friction', weight: 1 },
  { id: 'noticeable', label: 'Noticeable issue', weight: 2 },
  { id: 'blocking', label: 'Blocks progress', weight: 3 },
  { id: 'trust', label: 'Trust or safety concern', weight: 4 },
];

const fieldBaseClass =
  'mt-2 w-full border border-[color:var(--theme-border)] bg-white px-4 py-3 text-sm text-[color:var(--theme-text)] shadow-sm outline-none transition placeholder:text-[color:var(--theme-text-soft)] focus:border-[color:var(--theme-primary)] focus:shadow-[var(--theme-focus)]';

function getClarityScore(fields: {
  surface: string;
  issue: string;
  requestedFix: string;
  wantsAddition: boolean;
  addition: string;
  audience: string;
  importance: string;
  deviceContext: string;
}) {
  const checks = [
    fields.surface.trim().length >= 2,
    fields.issue.trim().length >= 18,
    fields.requestedFix.trim().length >= 12,
    !fields.wantsAddition || fields.addition.trim().length >= 12,
    !fields.wantsAddition || fields.audience.trim().length >= 8,
    !fields.wantsAddition || fields.importance.trim().length >= 8,
    fields.deviceContext.trim().length >= 3,
  ];

  return checks.filter(Boolean).length / checks.length;
}

function createPayloadSummary(submission: FeedbackSubmission) {
  return JSON.stringify(
    {
      source: 'feedback-intake',
      status: 'new-signal',
      ...submission,
    },
    null,
    2,
  );
}

export default function FeedbackIntake({
  productName = 'this product',
  title = 'Feedback Observatory',
  description = 'Report a page issue, request a fix, or suggest a useful addition in a way that is easy to triage.',
  defaultSurface = '',
  storageKey = 'feedback-intake:last-submission',
  onSubmit,
}: FeedbackIntakeProps) {
  const [surface, setSurface] = useState(defaultSurface);
  const [type, setType] = useState<FeedbackType>('bug');
  const [issue, setIssue] = useState('');
  const [requestedFix, setRequestedFix] = useState('');
  const [wantsAddition, setWantsAddition] = useState(false);
  const [addition, setAddition] = useState('');
  const [audience, setAudience] = useState('');
  const [importance, setImportance] = useState('');
  const [impact, setImpact] = useState<ImpactLevel>('noticeable');
  const [deviceContext, setDeviceContext] = useState('');
  const [contact, setContact] = useState('');
  const [allowFollowUp, setAllowFollowUp] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'submitted' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [receipt, setReceipt] = useState<FeedbackSubmitResult | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from') ?? params.get('url');
    if (!defaultSurface && fromParam) {
      setSurface(fromParam);
    }

    setDeviceContext(`${window.navigator.userAgent}; viewport ${window.innerWidth}x${window.innerHeight}`);
  }, [defaultSurface]);

  const selectedType = feedbackTypes.find((option) => option.id === type) ?? feedbackTypes[0];
  const selectedImpact = impactOptions.find((option) => option.id === impact) ?? impactOptions[1];

  const clarityScore = useMemo(
    () =>
      getClarityScore({
        surface,
        issue,
        requestedFix,
        wantsAddition,
        addition,
        audience,
        importance,
        deviceContext,
      }),
    [addition, audience, deviceContext, importance, issue, requestedFix, surface, wantsAddition],
  );

  const clarityLabel = clarityScore >= 0.82 ? 'Ready for triage' : clarityScore >= 0.48 ? 'Actionable draft' : 'Needs context';
  const progressWidthClass =
    clarityScore >= 0.9
      ? 'w-full'
      : clarityScore >= 0.75
        ? 'w-4/5'
        : clarityScore >= 0.6
          ? 'w-3/5'
          : clarityScore >= 0.45
            ? 'w-2/5'
            : clarityScore >= 0.3
              ? 'w-1/3'
              : 'w-1/4';

  const preview = useMemo(
    () => ({
      surface: surface.trim() || 'Waiting for page or feature',
      category: selectedType.label,
      impact: selectedImpact.label,
      need: wantsAddition && audience.trim() ? audience.trim() : issue.trim() || 'Describe what happened or what is missing.',
      fix: requestedFix.trim() || addition.trim() || 'Add the expected fix or improvement.',
      status: 'New signal',
    }),
    [addition, audience, issue, requestedFix, selectedImpact.label, selectedType.label, surface, wantsAddition],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!surface.trim() || !issue.trim() || !requestedFix.trim()) {
      return;
    }

    const submission: FeedbackSubmission = {
      surface: surface.trim(),
      type,
      issue: issue.trim(),
      requestedFix: requestedFix.trim(),
      wantsAddition,
      addition: addition.trim(),
      audience: audience.trim(),
      importance: importance.trim(),
      impact,
      deviceContext: deviceContext.trim(),
      contact: contact.trim(),
      allowFollowUp,
      submittedAt: new Date().toISOString(),
    };

    setStatus('saving');
    setSubmitError('');

    try {
      const customResult = await onSubmit?.(submission);
      let result = customResult;

      if (!result) {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission),
        });

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => undefined)) as { error?: string; details?: string[] } | undefined;
          throw new Error(errorBody?.details?.join(' ') || errorBody?.error || 'Feedback submission failed.');
        }

        result = (await response.json()) as FeedbackSubmitResult;
      }

      setReceipt(result);
      const payload = createPayloadSummary({
        ...submission,
        submittedAt: result?.createdAt ?? submission.submittedAt,
      });
      setSubmittedPayload(
        JSON.stringify(
          {
            receipt: result,
            payload: JSON.parse(payload) as unknown,
          },
          null,
          2,
        ),
      );
      try {
        window.localStorage.setItem(storageKey, payload);
      } catch {
        // Local storage is optional; the saved server receipt is the source of truth.
      }
      setStatus('submitted');
      // Never send free-form feedback, device context, or contact details to analytics.
      track('feedback_submitted', { type, impact, has_addition: wantsAddition });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Feedback submission failed.');
      setStatus('error');
    }
  }

  return (
    <section className="theme-shell space-y-6 px-3 pb-12 sm:px-4 md:px-6">
      <header className="grid gap-5 rounded-[var(--theme-radius-xl)] border border-[color:var(--theme-border)] bg-white/82 p-5 shadow-[var(--theme-shadow-md)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-7">
        <div className="min-w-0">
          <p className="theme-kicker">Product signal intake</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[color:var(--theme-text)] md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--theme-text-muted)] md:text-lg">
            {description}
          </p>
        </div>
        <div className="rounded-[var(--theme-radius-md)] border border-[color:var(--theme-border)] bg-[color:var(--theme-bg-soft)] p-4 text-sm">
          <p className="font-extrabold text-[color:var(--theme-text)]">For {productName}</p>
          <p className="mt-1 leading-6 text-[color:var(--theme-text-muted)]">Private by default. No account required.</p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <form onSubmit={handleSubmit} className="theme-card space-y-6 p-4 md:p-6">
          <section className="rounded-[var(--theme-radius-lg)] border border-[color:var(--theme-border)] bg-[color:var(--theme-bg-soft)] p-4">
            <p className="theme-kicker">Fast path</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              <li>Name the page or feature.</li>
              <li>Describe what happened.</li>
              <li>Describe the expected fix.</li>
            </ol>
          </section>

          <div>
            <label htmlFor="feedback-surface" className="text-sm font-extrabold text-[color:var(--theme-text)]">
              What page, feature, or URL is this about?
            </label>
            <input
              id="feedback-surface"
              value={surface}
              onChange={(event) => setSurface(event.target.value)}
              placeholder="/about, https://..., homepage, navigation, journal..."
              className={fieldBaseClass}
              required
            />
          </div>

          <fieldset>
            <legend className="text-sm font-extrabold text-[color:var(--theme-text)]">What kind of feedback is it?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {feedbackTypes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setType(option.id);
                    if (option.id === 'feature') setWantsAddition(true);
                  }}
                  className={`min-h-24 rounded-[var(--theme-radius-md)] border p-3 text-left transition ${
                    option.id === type
                      ? 'border-[color:var(--theme-primary)] bg-[color:var(--theme-bg-soft)] shadow-[var(--theme-focus)]'
                      : 'border-[color:var(--theme-border)] bg-white hover:border-[color:var(--theme-border-strong)]'
                  }`}
                >
                  <span className="block text-sm font-extrabold text-[color:var(--theme-text)]">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[color:var(--theme-text-muted)]">{option.description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="feedback-issue" className="text-sm font-extrabold text-[color:var(--theme-text)]">
                What is the issue?
              </label>
              <textarea
                id="feedback-issue"
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                placeholder="Describe what happened, felt confusing, broke, or seemed missing."
                rows={7}
                className={fieldBaseClass}
                required
              />
            </div>
            <div>
              <label htmlFor="feedback-fix" className="text-sm font-extrabold text-[color:var(--theme-text)]">
                What should be fixed?
              </label>
              <textarea
                id="feedback-fix"
                value={requestedFix}
                onChange={(event) => setRequestedFix(event.target.value)}
                placeholder="Describe the better behavior, wording, design, or flow."
                rows={7}
                className={fieldBaseClass}
                required
              />
            </div>
          </div>

          <details className="rounded-[var(--theme-radius-lg)] border border-[color:var(--theme-border)] bg-[color:var(--theme-bg-soft)] p-4">
            <summary className="cursor-pointer text-sm font-extrabold text-[color:var(--theme-text)]">
              Additional request context
            </summary>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={wantsAddition}
                onChange={(event) => setWantsAddition(event.target.checked)}
                className="mt-1 h-5 w-5 rounded border-[color:var(--theme-border)] accent-[color:var(--theme-primary)]"
              />
              <span>
                <span className="block text-sm font-extrabold text-[color:var(--theme-text)]">
                  More needs to be added
                </span>
                <span className="mt-1 block text-sm leading-6 text-[color:var(--theme-text-muted)]">
                  Use this when the fix is really a new capability, content area, workflow, or support path.
                </span>
              </span>
            </label>

            {wantsAddition ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="feedback-addition" className="text-xs font-extrabold uppercase tracking-[0.08em] text-[color:var(--theme-text-muted)]">
                    What should be added?
                  </label>
                  <textarea
                    id="feedback-addition"
                    value={addition}
                    onChange={(event) => setAddition(event.target.value)}
                    rows={4}
                    className={fieldBaseClass}
                    placeholder="New feature, content, setting, integration..."
                  />
                </div>
                <div>
                  <label htmlFor="feedback-audience" className="text-xs font-extrabold uppercase tracking-[0.08em] text-[color:var(--theme-text-muted)]">
                    Who would this help?
                  </label>
                  <textarea
                    id="feedback-audience"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    rows={4}
                    className={fieldBaseClass}
                    placeholder="Students, mentors, admins, first-time visitors..."
                  />
                </div>
                <div>
                  <label htmlFor="feedback-importance" className="text-xs font-extrabold uppercase tracking-[0.08em] text-[color:var(--theme-text-muted)]">
                    Why does it matter?
                  </label>
                  <textarea
                    id="feedback-importance"
                    value={importance}
                    onChange={(event) => setImportance(event.target.value)}
                    rows={4}
                    className={fieldBaseClass}
                    placeholder="What outcome, risk, or user need does it support?"
                  />
                </div>
              </div>
            ) : null}
          </details>

          <fieldset>
            <legend className="text-sm font-extrabold text-[color:var(--theme-text)]">How serious is it?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {impactOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setImpact(option.id)}
                  className={`rounded-[var(--theme-radius-md)] border px-3 py-3 text-left text-sm font-extrabold transition ${
                    option.id === impact
                      ? 'border-[color:var(--theme-primary)] bg-[color:var(--theme-bg-soft)] text-[color:var(--theme-primary-strong)] shadow-[var(--theme-focus)]'
                      : 'border-[color:var(--theme-border)] bg-white text-[color:var(--theme-text)] hover:border-[color:var(--theme-border-strong)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)]">
            <div>
              <label htmlFor="feedback-device" className="text-sm font-extrabold text-[color:var(--theme-text)]">
                Device or browser context
              </label>
              <input
                id="feedback-device"
                value={deviceContext}
                onChange={(event) => setDeviceContext(event.target.value)}
                className={fieldBaseClass}
                placeholder="Chrome on Mac, Safari on iPhone, screen size..."
              />
            </div>
            <div>
              <label htmlFor="feedback-contact" className="text-sm font-extrabold text-[color:var(--theme-text)]">
                Contact email, optional
              </label>
              <input
                id="feedback-contact"
                type="email"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                className={fieldBaseClass}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[color:var(--theme-text-muted)]">
            <input
              type="checkbox"
              checked={allowFollowUp}
              onChange={(event) => setAllowFollowUp(event.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[color:var(--theme-border)] accent-[color:var(--theme-primary)]"
            />
            <span>It is okay to follow up if more detail would help reproduce or prioritize this.</span>
          </label>

          <div className="flex flex-col gap-3 border-t border-[color:var(--theme-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[color:var(--theme-text-muted)]">
              Required: page or feature, issue, and requested fix.
            </p>
            <button type="submit" className="theme-button theme-button-primary px-6 py-3" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving signal...' : 'Submit feedback'}
            </button>
          </div>
          {status === 'error' ? (
            <div className="rounded-[var(--theme-radius-md)] border border-red-200 bg-red-50 p-3 text-sm font-semibold leading-6 text-red-800" role="alert">
              {submitError}
            </div>
          ) : null}
        </form>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="theme-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="theme-kicker">Signal quality</p>
                <h2 className="mt-2 text-xl font-extrabold text-[color:var(--theme-text)]">{clarityLabel}</h2>
              </div>
              <span className="rounded-full border border-[color:var(--theme-border)] bg-white px-3 py-1 text-xs font-extrabold text-[color:var(--theme-primary-strong)]">
                {Math.round(clarityScore * 100)}%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--theme-bg-soft)]">
              <div className={`h-full rounded-full bg-[color:var(--theme-primary)] transition-all ${progressWidthClass}`} />
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--theme-text-muted)]">
              Strong reports name the surface, describe the problem, explain the expected fix, and include context.
            </p>
          </section>

          <section className="theme-card p-5">
            <p className="theme-kicker">Triage preview</p>
            <dl className="mt-4 space-y-3">
              {[
                ['Surface', preview.surface],
                ['Category', preview.category],
                ['Impact', preview.impact],
                ['User need', preview.need],
                ['Requested fix', preview.fix],
                ['Status', preview.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[var(--theme-radius-md)] border border-[color:var(--theme-border)] bg-white p-3">
                  <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-[color:var(--theme-text-soft)]">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-[color:var(--theme-text)]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="theme-card p-5">
            <p className="theme-kicker">Review path</p>
            <ol className="mt-4 grid gap-3 text-sm font-semibold text-[color:var(--theme-text)]">
              {['Submitted', 'Reviewed', 'Prioritized', 'Fixed or added'].map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--theme-bg-soft)] text-xs font-extrabold text-[color:var(--theme-primary-strong)]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {status === 'submitted' ? (
        <section className="theme-card p-5 md:p-6" aria-live="polite">
          <p className="theme-kicker">Signal received</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--theme-text)]">Thanks for making this sharper.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--theme-text-muted)]">
            Your feedback was saved and is ready for admin review. Keep the receipt ID if you want to reference this signal later.
          </p>
          {receipt ? (
            <div className="mt-4 grid gap-3 rounded-[var(--theme-radius-md)] border border-[color:var(--theme-border)] bg-[color:var(--theme-bg-soft)] p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="theme-kicker">Receipt</p>
                <p className="mt-1 break-all font-extrabold text-[color:var(--theme-text)]">{receipt.id}</p>
              </div>
              <div>
                <p className="theme-kicker">Status</p>
                <p className="mt-1 font-extrabold text-[color:var(--theme-text)]">{receipt.status}</p>
              </div>
              <div>
                <p className="theme-kicker">Saved</p>
                <p className="mt-1 font-extrabold text-[color:var(--theme-text)]">{new Date(receipt.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ) : null}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-extrabold text-[color:var(--theme-primary-strong)]">
              View submission payload
            </summary>
            <pre className="mt-3 max-h-80 overflow-auto rounded-[var(--theme-radius-md)] border border-[color:var(--theme-border)] bg-[color:var(--theme-bg-strong)] p-4 text-xs leading-5 text-white">
              {submittedPayload}
            </pre>
          </details>
        </section>
      ) : null}
    </section>
  );
}
