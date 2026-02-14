"use client"

import AnimatedCounter from "./AnimatedCounter";
import { useStats } from "@/app/hooks";
import { useTranslations } from 'next-intl';

export default function TotalClicksWidget() {
  const t = useTranslations('Dashboard');
  const { totalClicks } = useStats();

  return (
    <>
      <h2 className='text-md'>{t('totalClicks')}</h2>
      <p className='text-end text-5xl font-black italic'>
        <AnimatedCounter value={totalClicks} delay={0.15} />
      </p>
    </>
  );
}
