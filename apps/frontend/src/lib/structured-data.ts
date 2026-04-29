import { toAbsoluteUrl } from './site';

function normalizeStepText(step: string) {
  return step
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractHowToStepsFromMarkdown(markdown: string, maxSteps = 8): string[] {
  const lines = markdown.split(/\r?\n/).map((line) => line.trim());
  const numbered = lines
    .filter((line) => /^\d+[.)]\s+\S+/.test(line))
    .map(normalizeStepText)
    .filter((line) => line.length > 0);

  if (numbered.length >= 3) {
    return numbered.slice(0, maxSteps);
  }

  const bullet = lines
    .filter((line) => /^[-*]\s+\S+/.test(line))
    .map(normalizeStepText)
    .filter((line) => line.length > 0);

  if (bullet.length >= 3) {
    return bullet.slice(0, maxSteps);
  }

  return [];
}

export function createHowToJsonLd({
  name,
  description,
  path,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  path: string;
  steps: string[];
  totalTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    url: toAbsoluteUrl(path),
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: `Step ${index + 1}`,
      text: step,
      url: toAbsoluteUrl(path),
    })),
  };
}
