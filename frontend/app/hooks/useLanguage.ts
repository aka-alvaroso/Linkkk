'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';

/**
 * Hook to manage language switching
 */
export function useLanguage() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();

  const changeLanguage = (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year

    // Force full page reload to apply new locale
    window.location.reload();
  };

  return {
    currentLocale,
    changeLanguage,
    availableLocales: locales,
  };
}
