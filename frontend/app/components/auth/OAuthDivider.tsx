"use client";

import { useTranslations } from 'next-intl';

export default function OAuthDivider() {
  const t = useTranslations('Auth.OAuth');

  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <div className="flex-1 h-[2px] bg-dark/10" />
      <span className="text-dark/50 font-bold text-sm uppercase tracking-wider">
        {t('or')}
      </span>
      <div className="flex-1 h-[2px] bg-dark/10" />
    </div>
  );
}
