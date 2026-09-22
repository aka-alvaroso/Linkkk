// Converts a 2-letter country code (e.g. "ES") into its localized display
// name (e.g. "España" / "Spain"). Falls back to the raw code if the runtime
// can't resolve it (Intl.DisplayNames is unsupported or the code is invalid,
// e.g. the "UNKNOWN" the backend returns when geolocation fails).
export function getCountryName(code: string | undefined | null, locale: string): string | null {
  if (!code || code === 'UNKNOWN') return null;

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}
