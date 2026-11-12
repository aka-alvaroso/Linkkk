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
    es: 'Español',
    en: 'English',
  };

  return (
    <div className="flex items-center gap-1">
      {availableLocales.map((locale) => {
        const isActive = currentLocale === locale;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={isActive}
            onClick={() => !isActive && changeLanguage(locale)}
            className={`min-h-11 px-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              isActive
                ? variant === 'dark'
                  ? 'bg-light/15 text-light'
                  : 'bg-dark/10 text-dark'
                : variant === 'dark'
                  ? 'text-light/70 hover:text-light'
                  : 'text-dark/70 hover:text-dark'
            }`}
          >
            {languageLabels[locale]}
          </button>
        );
      })}
    </div>
  );
}
