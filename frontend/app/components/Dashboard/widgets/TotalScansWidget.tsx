"use client"

import AnimatedCounter from "./AnimatedCounter";
import { useStats } from "@/app/hooks";
import { useTranslations } from 'next-intl';

export default function TotalScansWidget() {
  const t = useTranslations('Dashboard');
  const { totalScans } = useStats();

  return (
    <>
      <h2 className='text-md'>{t('totalScans')}</h2>
      <p className='text-end text-5xl font-black italic'>
        <AnimatedCounter value={totalScans} delay={0.15} />
      </p>
    </>
  );
}
