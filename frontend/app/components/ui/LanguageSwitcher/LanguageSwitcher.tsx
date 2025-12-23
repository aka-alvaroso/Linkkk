'use client';

import { useLanguage } from '@/app/hooks';
import { type Locale } from '@/i18n/request';

/**
 * Language Switcher Component
 * Simple dropdown to switch between available languages
 *
 * Usage:
 * <LanguageSwitcher />
 */
export default function LanguageSwitcher() {
  const { currentLocale, changeLanguage, availableLocales } = useLanguage();

  const languageNames: Record<Locale, string> = {
    es: '🇪🇸 Español',
    en: '🇬🇧 English',
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => changeLanguage(e.target.value as Locale)}
      className="px-3 py-2 border border-dark/20 rounded-lg bg-light cursor-pointer hover:border-dark/40 transition-colors"
    >
      {availableLocales.map((locale) => (
        <option key={locale} value={locale}>
          {languageNames[locale]}
        </option>
      ))}
    </select>
  );
}
