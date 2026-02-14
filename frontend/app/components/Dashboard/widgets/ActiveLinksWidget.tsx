"use client"

import AnimatedCounter from "./AnimatedCounter";
import { useStats } from "@/app/hooks";
import { useTranslations } from 'next-intl';

export default function ActiveLinksWidget() {
  const t = useTranslations('Dashboard');
  const { activeLinks } = useStats();

  return (
    <>
      <h2 className='text-md'>{t('activeLinks')}</h2>
      <p className='text-end text-5xl font-black italic'>
        <AnimatedCounter value={activeLinks} delay={0.15} />
      </p>
    </>
  );
}
