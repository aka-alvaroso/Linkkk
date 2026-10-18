export interface UtmValues {
  source: string;
  medium: string;
  campaign: string;
}

export const EMPTY_UTM: UtmValues = { source: '', medium: '', campaign: '' };

// Common values offered as suggestions; the user can still type anything.
export const UTM_SUGGESTIONS = {
  source: ['newsletter', 'instagram', 'facebook', 'x', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'google', 'qr'],
  medium: ['email', 'social', 'cpc', 'banner', 'referral', 'qr', 'sms'],
} as const;

const MAX_VALUE_LENGTH = 100;

/**
 * Keeps a UTM value in the shape the backend stores it (lowercase) and the
 * shape that is safe in a URL without encoding: spaces become hyphens and
 * anything outside letters, digits, `_`, `-` and `.` is dropped. Trailing
 * separators are kept so the user can keep typing "summer sale".
 */
export const normalizeUtmValue = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, MAX_VALUE_LENGTH);

const cleanForUrl = (value: string): string =>
  normalizeUtmValue(value).replace(/^[-_.]+|[-_.]+$/g, '');

/**
 * Appends the filled utm_* params to a short URL. Empty fields are skipped,
 * and the URL is returned untouched when nothing is filled in.
 */
export const buildUtmUrl = (baseUrl: string, values: UtmValues): string => {
  const params = [
    ['utm_source', cleanForUrl(values.source)],
    ['utm_medium', cleanForUrl(values.medium)],
    ['utm_campaign', cleanForUrl(values.campaign)],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`);

  return params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
};
