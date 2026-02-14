"use client"

import { useMemo } from "react";
import AnimatedCounter from "./AnimatedCounter";
import { useLinkStore } from "@/app/stores/linkStore";
import { useTranslations } from 'next-intl';

export default function ApiUsageWidget() {
  const t = useTranslations('Dashboard');
  const { links } = useLinkStore();

  const linksThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return links.filter(l => new Date(l.createdAt) >= startOfMonth).length;
  }, [links]);

  return (
    <>
      <h2 className='text-md'>{t('apiUsage')}</h2>
      <p className='text-end text-5xl font-black italic'>
        <AnimatedCounter value={linksThisMonth} delay={0.15} />
      </p>
    </>
  );
}
