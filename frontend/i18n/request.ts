import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export { locales, defaultLocale };
export type { Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // This will be the locale from the provider or 'es' as fallback
  let locale = await requestLocale;

  // Ensure the locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
