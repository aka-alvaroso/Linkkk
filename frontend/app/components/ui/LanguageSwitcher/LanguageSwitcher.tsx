'use client';

import { useLanguage } from '@/app/hooks';
import { type Locale } from '@/i18n/request';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

/**
 * Language Switcher Component
 * Toggle between available languages
 */
export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { currentLocale, changeLanguage, availableLocales } = useLanguage();

  const languageLabels: Record<Locale, string> = {
    es: '🇪🇸 ES',
    en: '🇬🇧 EN',
  };

  return (
    <div className="flex items-center gap-1">
      {availableLocales.map((locale) => {
        const isActive = currentLocale === locale;
        return (
          <button
            key={locale}
            onClick={() => !isActive && changeLanguage(locale)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? variant === 'dark'
                  ? 'bg-light/15 text-light'
                  : 'bg-dark/10 text-dark'
                : variant === 'dark'
                  ? 'text-light/40 hover:text-light/70'
                  : 'text-dark/40 hover:text-dark/70'
            }`}
          >
            {languageLabels[locale]}
          </button>
        );
      })}
    </div>
  );
}
