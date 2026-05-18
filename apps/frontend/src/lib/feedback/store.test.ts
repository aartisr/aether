import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { listFeedbackSubmissions, saveFeedbackSubmission, validateFeedbackSubmission } from './store';

describe('feedback store', () => {
  const originalStorePath = process.env.FEEDBACK_STORE_PATH;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aether-feedback-'));
    process.env.FEEDBACK_STORE_PATH = path.join(tempDir, 'feedback.jsonl');
  });

  afterEach(async () => {
    process.env.FEEDBACK_STORE_PATH = originalStorePath;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('validates required fields', () => {
    const result = validateFeedbackSubmission({
      surface: '/blog',
      type: 'bug',
      issue: 'Button text is not readable.',
      requestedFix: 'Increase contrast and make the state theme-aware.',
      impact: 'noticeable',
    });

    expect(result.ok).toBe(true);
  });

  it('rejects invalid feedback', () => {
    const result = validateFeedbackSubmission({
      surface: '',
      type: 'unknown',
      issue: 'bad',
      requestedFix: '',
      impact: 'loud',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(1);
    }
  });

  it('persists and lists submissions newest first', async () => {
    const first = await saveFeedbackSubmission({
      surface: '/feedback',
      type: 'feature',
      issue: 'Need admin review for submissions.',
      requestedFix: 'Add an admin review page.',
      wantsAddition: true,
      addition: 'Admin review dashboard',
      impact: 'noticeable',
    });
    const second = await saveFeedbackSubmission({
      surface: '/blog',
      type: 'accessibility',
      issue: 'CTA text has insufficient contrast.',
      requestedFix: 'Make CTA colors theme-aware.',
      impact: 'trust',
    });

    const submissions = await listFeedbackSubmissions();

    expect(submissions).toHaveLength(2);
    expect(submissions[0].id).toBe(second.id);
    expect(submissions[1].id).toBe(first.id);
    expect(submissions[0].status).toBe('new');
  });
});
