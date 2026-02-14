"use client"

import AnimatedCounter from "./AnimatedCounter";
import { useStats, useAuth } from "@/app/hooks";
import { useTranslations } from 'next-intl';

export default function TotalLinksWidget() {
  const t = useTranslations('Dashboard');
  const { totalLinks } = useStats();
  const { isGuest, user } = useAuth();

  const getLinkLimit = () => {
    if (isGuest) return 3;
    if (!user) return 3;
    if (user.role === 'PRO') return null;
    return 50;
  };

  const linkLimit = getLinkLimit();

  return (
    <>
      <h2 className='text-md'>{t('totalLinks')}</h2>
      <p className='text-end text-5xl font-black italic flex items-end justify-end gap-1'>
        <AnimatedCounter value={totalLinks} delay={0.15} />
        {linkLimit !== null && (
          <span className='text-lg text-dark/40 font-normal'>/{linkLimit}</span>
        )}
      </p>
    </>
  );
}
