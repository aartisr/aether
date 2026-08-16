export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

export type AnalyticsEvent = {
  name: string;
  properties: AnalyticsProperties;
};

type AnalyticsListener = (event: AnalyticsEvent) => void;

const maxBufferedEvents = 25;
const listeners = new Set<AnalyticsListener>();
const bufferedEvents: AnalyticsEvent[] = [];
const sensitivePropertyPattern = /(?:email|e-mail|phone|address|name|message|comment|transcript|audio|text|content|token|secret|password|contact|issue|feedback)/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+?\d[\d().\s-]{7,}\d)/;

function sanitizeValue(value: AnalyticsValue): AnalyticsValue {
  if (typeof value !== 'string') return value;
  if (emailPattern.test(value) || phonePattern.test(value)) return '[redacted]';
  return value.slice(0, 120);
}

/**
 * Sends privacy-safe product signals to the configured analytics adapter.
 * Events are bounded in memory until an adapter is ready; no browser storage
 * or network work happens when analytics is not configured.
 */
export function track(name: string, properties: AnalyticsProperties = {}) {
  const safeProperties = Object.entries(properties).reduce<AnalyticsProperties>((result, [key, value]) => {
    if (!sensitivePropertyPattern.test(key)) result[key] = sanitizeValue(value);
    return result;
  }, {});
  const event: AnalyticsEvent = { name, properties: safeProperties };

  if (listeners.size === 0) {
    if (bufferedEvents.length === maxBufferedEvents) bufferedEvents.shift();
    bufferedEvents.push(event);
    return;
  }

  listeners.forEach((listener) => listener(event));
}

export function subscribeToAnalytics(listener: AnalyticsListener) {
  listeners.add(listener);
  bufferedEvents.splice(0).forEach(listener);
  return () => listeners.delete(listener);
}
