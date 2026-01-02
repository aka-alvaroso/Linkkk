'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { userService } from '@/app/services/api/userService';
import { useAuthStore } from '@/app/stores/authStore';

/**
 * Hook to manage language switching
 */
export function useLanguage() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const { user } = useAuthStore();

  const changeLanguage = async (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year

    // If user is authenticated, save preference to database
    if (user) {
      try {
        await userService.updateLocale(newLocale);
      } catch (error) {
        console.error('Failed to save locale preference:', error);
        // Continue with locale change even if API call fails
      }
    }

    // Force full page reload to apply new locale
    window.location.reload();
  };

  return {
    currentLocale,
    changeLanguage,
    availableLocales: locales,
  };
}
