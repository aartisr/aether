import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export type FeedbackType =
  | 'bug'
  | 'content'
  | 'design'
  | 'accessibility'
  | 'privacy'
  | 'performance'
  | 'feature';

export type FeedbackImpact = 'tiny' | 'noticeable' | 'blocking' | 'trust';

export type FeedbackStatus = 'new' | 'reviewed' | 'planned' | 'fixed' | 'closed';

export type FeedbackSubmissionInput = {
  surface: string;
  type: FeedbackType;
  issue: string;
  requestedFix: string;
  wantsAddition?: boolean;
  addition?: string;
  audience?: string;
  importance?: string;
  impact: FeedbackImpact;
  deviceContext?: string;
  contact?: string;
  allowFollowUp?: boolean;
  submittedAt?: string;
};

export type FeedbackRecord = Required<FeedbackSubmissionInput> & {
  id: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  fingerprint: string;
};

type ValidationResult =
  | { ok: true; value: FeedbackSubmissionInput }
  | { ok: false; errors: string[] };

const feedbackTypes = new Set<FeedbackType>([
  'bug',
  'content',
  'design',
  'accessibility',
  'privacy',
  'performance',
  'feature',
]);

const feedbackImpacts = new Set<FeedbackImpact>(['tiny', 'noticeable', 'blocking', 'trust']);

function getStorePath() {
  return path.resolve(process.env.FEEDBACK_STORE_PATH ?? path.join(process.cwd(), '.data', 'feedback-submissions.jsonl'));
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeBoolean(value: unknown) {
  return value === true;
}

function createFingerprint(input: Pick<FeedbackSubmissionInput, 'surface' | 'type' | 'issue' | 'requestedFix'>) {
  return createHash('sha256')
    .update([input.surface, input.type, input.issue, input.requestedFix].join('\n').toLowerCase())
    .digest('hex')
    .slice(0, 16);
}

export function validateFeedbackSubmission(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['Submission body must be an object.'] };
  }

  const candidate = input as Record<string, unknown>;
  const type = candidate.type as FeedbackType;
  const impact = candidate.impact as FeedbackImpact;
  const value: FeedbackSubmissionInput = {
    surface: normalizeText(candidate.surface, 300),
    type,
    issue: normalizeText(candidate.issue, 4000),
    requestedFix: normalizeText(candidate.requestedFix, 4000),
    wantsAddition: normalizeBoolean(candidate.wantsAddition),
    addition: normalizeText(candidate.addition, 2500),
    audience: normalizeText(candidate.audience, 1000),
    importance: normalizeText(candidate.importance, 1500),
    impact,
    deviceContext: normalizeText(candidate.deviceContext, 1000),
    contact: normalizeText(candidate.contact, 320),
    allowFollowUp: normalizeBoolean(candidate.allowFollowUp),
    submittedAt: normalizeText(candidate.submittedAt, 80),
  };

  const errors: string[] = [];
  if (value.surface.length < 2) errors.push('Page, feature, or URL is required.');
  if (!feedbackTypes.has(value.type)) errors.push('Feedback type is invalid.');
  if (value.issue.length < 10) errors.push('Issue must include at least 10 characters.');
  if (value.requestedFix.length < 8) errors.push('Requested fix must include at least 8 characters.');
  if (!feedbackImpacts.has(value.impact)) errors.push('Impact level is invalid.');
  if (value.contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contact)) errors.push('Contact email is invalid.');
  if (value.wantsAddition && (value.addition ?? '').length < 8) errors.push('Feature addition detail is required.');

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value };
}

export async function saveFeedbackSubmission(input: FeedbackSubmissionInput): Promise<FeedbackRecord> {
  const now = new Date().toISOString();
  const record: FeedbackRecord = {
    id: `fb_${randomUUID()}`,
    surface: input.surface,
    type: input.type,
    issue: input.issue,
    requestedFix: input.requestedFix,
    wantsAddition: input.wantsAddition ?? false,
    addition: input.addition ?? '',
    audience: input.audience ?? '',
    importance: input.importance ?? '',
    impact: input.impact,
    deviceContext: input.deviceContext ?? '',
    contact: input.contact ?? '',
    allowFollowUp: input.allowFollowUp ?? false,
    submittedAt: input.submittedAt || now,
    status: 'new',
    createdAt: now,
    updatedAt: now,
    fingerprint: createFingerprint(input),
  };

  const storePath = getStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.appendFile(storePath, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

export async function listFeedbackSubmissions(limit = 100): Promise<FeedbackRecord[]> {
  const storePath = getStorePath();

  try {
    const raw = await fs.readFile(storePath, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as FeedbackRecord)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export function getFeedbackStoreLocation() {
  return getStorePath();
}
