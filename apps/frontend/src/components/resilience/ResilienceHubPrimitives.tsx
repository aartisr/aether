import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type HubTone = 'neutral' | 'stabilize' | 'navigate' | 'belong' | 'practice' | 'urgent';

type HubSectionProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: HubTone;
  aside?: ReactNode;
  children: ReactNode;
};

const toneStyles: Record<HubTone, { border: string; eyebrow: string; focus: string; soft: string; strong: string }> = {
  neutral: {
    border: 'border-slate-200',
    eyebrow: 'text-slate-700',
    focus: 'focus:ring-slate-300',
    soft: 'bg-slate-50 text-slate-900 border-slate-200',
    strong: 'bg-slate-950 text-white hover:bg-slate-800',
  },
  stabilize: {
    border: 'border-rose-200',
    eyebrow: 'text-rose-800',
    focus: 'focus:ring-rose-300',
    soft: 'bg-rose-50 text-rose-950 border-rose-200',
    strong: 'bg-rose-800 text-white hover:bg-rose-900',
  },
  navigate: {
    border: 'border-sky-200',
    eyebrow: 'text-sky-800',
    focus: 'focus:ring-sky-300',
    soft: 'bg-sky-50 text-sky-950 border-sky-200',
    strong: 'bg-sky-800 text-white hover:bg-sky-900',
  },
  belong: {
    border: 'border-emerald-200',
    eyebrow: 'text-emerald-800',
    focus: 'focus:ring-emerald-300',
    soft: 'bg-emerald-50 text-emerald-950 border-emerald-200',
    strong: 'bg-emerald-800 text-white hover:bg-emerald-900',
  },
  practice: {
    border: 'border-amber-200',
    eyebrow: 'text-amber-900',
    focus: 'focus:ring-amber-300',
    soft: 'bg-amber-50 text-amber-950 border-amber-200',
    strong: 'bg-amber-800 text-white hover:bg-amber-900',
  },
  urgent: {
    border: 'border-red-200',
    eyebrow: 'text-red-800',
    focus: 'focus:ring-red-300',
    soft: 'bg-red-50 text-red-950 border-red-200',
    strong: 'bg-red-800 text-white hover:bg-red-900',
  },
};

export function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export function getHubTone(tone: HubTone = 'neutral') {
  return toneStyles[tone];
}

export function HubSection({
  id,
  eyebrow,
  title,
  description,
  tone = 'neutral',
  aside,
  children,
}: HubSectionProps) {
  const styles = getHubTone(tone);

  return (
    <section id={id} className={cx('rounded-2xl bg-white p-4 shadow-soft sm:p-6', styles.border, 'border')}>
      <div className={aside ? 'grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-start' : undefined}>
        <div>
          <p className={cx('text-xs font-black uppercase tracking-[0.14em]', styles.eyebrow)}>{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function HubPanel({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: HubTone;
}) {
  return (
    <div className={cx('rounded-xl border p-4', getHubTone(tone).soft, className)}>
      {children}
    </div>
  );
}

export function HubAction({
  children,
  className,
  tone = 'neutral',
  variant = 'solid',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: HubTone;
  variant?: 'solid' | 'outline';
}) {
  const styles = getHubTone(tone);

  return (
    <button
      {...props}
      className={cx(
        'min-h-11 rounded-lg px-4 py-2.5 text-sm font-bold transition focus:outline-none focus:ring-2',
        variant === 'solid' ? styles.strong : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
        styles.focus,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function HubLinkAction({
  children,
  className,
  tone = 'neutral',
  variant = 'solid',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: HubTone;
  variant?: 'solid' | 'outline';
}) {
  const styles = getHubTone(tone);

  return (
    <a
      {...props}
      className={cx(
        'inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-center text-sm font-bold no-underline transition focus:outline-none focus:ring-2',
        variant === 'solid' ? styles.strong : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
        styles.focus,
        className,
      )}
    >
      {children}
    </a>
  );
}

export function hubInputClass(tone: HubTone = 'neutral') {
  return cx(
    'mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-950 focus:outline-none focus:ring-2',
    getHubTone(tone).focus,
  );
}
