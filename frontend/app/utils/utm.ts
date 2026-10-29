import type { UtmParam } from '@/app/types';

export interface ParamRow {
  id: string;
  key: string;
  value: string;
}

let rowCounter = 0;
/** A new empty row; ids only need to be unique within the page. */
export const createParamRow = (key = ""): ParamRow => ({ id: `row-${rowCounter++}`, key, value: "" });

/** Starting rows of the builder: the three UTM params people use most. */
export const defaultParamRows = (): ParamRow[] =>
  ['utm_source', 'utm_medium', 'utm_campaign'].map((key) => createParamRow(key));

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

// Common values offered as suggestions; the user can still type anything.
export const UTM_VALUE_SUGGESTIONS: Record<string, readonly string[]> = {
  utm_source: ['newsletter', 'instagram', 'facebook', 'x', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'google', 'qr'],
  utm_medium: ['email', 'social', 'cpc', 'banner', 'referral', 'qr', 'sms'],
};

// Limits enforced by the backend's query-param sanitizer.
export const MAX_PARAMS = 10;
export const MAX_KEY_LENGTH = 50;
export const MAX_VALUE_LENGTH = 500;
const MAX_UTM_VALUE_LENGTH = 100;
const RESERVED_KEYS = ['src'];

export const isUtmKey = (key: string): boolean =>
  (UTM_KEYS as readonly string[]).includes(key.toLowerCase());

/** Keys only allow letters, digits, `_` and `-`; spaces become underscores. */
export const normalizeKey = (key: string): string =>
  key
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, MAX_KEY_LENGTH);

/**
 * UTM values are stored lowercase by the backend and kept URL-safe here:
 * spaces become hyphens and anything outside letters, digits, `_`, `-` and `.`
 * is dropped. Trailing separators are kept while typing ("summer sale").
 */
export const normalizeUtmValue = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, MAX_UTM_VALUE_LENGTH);

/** Custom (non-UTM) values keep their case; only what the backend rejects is dropped. */
export const normalizeValue = (key: string, value: string): string =>
  isUtmKey(key) ? normalizeUtmValue(value) : value.replace(/\{\{|\}\}/g, '').slice(0, MAX_VALUE_LENGTH);

export type RowIssue = 'reserved' | 'duplicate' | null;

/** Why a row will be left out of the generated URL, if it will. */
export const rowIssue = (rows: ParamRow[], row: ParamRow): RowIssue => {
  const key = row.key.trim();
  if (!key) return null;
  if (RESERVED_KEYS.includes(key.toLowerCase())) return 'reserved';
  const firstIndex = rows.findIndex((r) => r.key.trim().toLowerCase() === key.toLowerCase());
  return rows[firstIndex]?.id === row.id ? null : 'duplicate';
};

const trimSeparators = (value: string): string => value.replace(/^[-_.]+|[-_.]+$/g, '');

/**
 * The params a row list stands for: rows with an empty key or value, a reserved
 * key or a repeated key are left out, and at most MAX_PARAMS are kept. This is
 * also the shape saved with the link.
 */
export const paramsFromRows = (rows: ParamRow[]): UtmParam[] =>
  rows
    .filter((row) => rowIssue(rows, row) === null)
    .map((row) => {
      const key = row.key.trim();
      const value = isUtmKey(key) ? trimSeparators(row.value) : row.value.trim();
      return { key, value };
    })
    .filter((param) => param.key && param.value)
    .slice(0, MAX_PARAMS);

/** Rows to edit for a link: its saved params, or the starter UTM rows when it has none. */
export const rowsFromParams = (params?: UtmParam[] | null): ParamRow[] =>
  params && params.length > 0
    ? params.map((param) => ({ ...createParamRow(param.key), value: param.value }))
    : defaultParamRows();

/** Appends params to a short URL; returned untouched when there are none. */
export const buildUrlFromParams = (baseUrl: string, params: UtmParam[]): string =>
  params.length > 0
    ? `${baseUrl}?${params.map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join('&')}`
    : baseUrl;

/** Appends the filled-in rows to a short URL. */
export const buildParamsUrl = (baseUrl: string, rows: ParamRow[]): string =>
  buildUrlFromParams(baseUrl, paramsFromRows(rows));
